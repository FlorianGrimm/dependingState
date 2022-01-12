import type {
    DSDirtyHandler,
    DSEvent,
    DSEventHandler,
    DSEventHandlerResult,
    DSPayloadEntity,
    DSUnlisten,
    DSEventName,
    IDSValueStore,
    IDSStateValue,
    WrappedDSStateValue,
    IDSStoreManager,
    IDSUIStateValue,
    ConfigurationDSValueStore,
    ConfigurationDSArrayValueStore,
    ConfigurationDSMapValueStore,
    ConfigurationDSEntityValueStore,
    DSEventValue,
} from './types'

import {
    DSStateValue
} from './DSStateValue';
import { DSEventAttach, DSEventDetach } from '.';
import { dsLog } from './DSLog';

//, StoreName extends string = string
export class DSValueStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),
    StoreName extends string = string
    > implements IDSValueStore<Value, StateValue, StoreName>{
    storeName: StoreName;
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    listenToAnyStore: boolean;
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler }[]>;
    arrDirtyHandler: { msg: string, handler: DSDirtyHandler<StateValue> }[];
    arrDirtyRelated: { msg: string, valueStore: IDSValueStore }[] | undefined;
    setEffectiveEvents: Set<string> | undefined;
    isDirty: boolean;
    configuration: ConfigurationDSValueStore<Value, StateValue>;

    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSValueStore<Value, StateValue>
    ) {
        this.storeName = storeName;
        this.storeManager = undefined;
        this.listenToAnyStore = false;
        this.mapEventHandlers = new Map();
        this.arrDirtyHandler = [];
        this.isDirty = false;
        this.stateVersion = 1;
        if (configuration === undefined) {
            this.configuration = {};
        } else {
            this.configuration = { ...configuration };
        }
    }

    public getNextStateVersion(stateVersion: number): number {
        if (this.storeManager === undefined) {
            return (this.stateVersion = (Math.max(this.stateVersion, stateVersion) + 1));
        } else {
            return (this.stateVersion = this.storeManager.getNextStateVersion(stateVersion));
        }
    }

    public postAttached(): void {
        this.stateVersion = this.storeManager!.getNextStateVersion(0);
        if (this.configuration.postAttached !== undefined) {
            this.configuration.postAttached();
        }
    }

    public listenDirtyRelated<RelatedValueStore extends IDSValueStore>(msg: string, relatedValueStore: RelatedValueStore): DSUnlisten {
        if (this.arrDirtyRelated === undefined) {
            this.arrDirtyRelated = [];
        }
        const index = this.arrDirtyRelated.findIndex((item) => (item.valueStore === relatedValueStore));
        if (index < 0) {
            this.arrDirtyRelated = (this.arrDirtyRelated || []).concat([{ msg: msg, valueStore: relatedValueStore }]);
            return this.unlistenDirtyRelated.bind(this, relatedValueStore);
        } else {
            return (() => { });
        }
    }

    public unlistenDirtyRelated<RelatedValueStore extends IDSValueStore>(relatedValueStore: RelatedValueStore): void {
        if (this.arrDirtyRelated !== undefined) {
            this.arrDirtyRelated = this.arrDirtyRelated.filter((item) => (item.valueStore !== relatedValueStore));
            if (this.arrDirtyRelated.length === 0) {
                this.arrDirtyRelated = undefined;
            }
        }
    }

    public emitDirty(stateValue: StateValue): void {
        if (dsLog.enabled) {
            dsLog.info(`DS store.emitDirty ${this.storeName}`);
        }
        if (this.arrDirtyRelated !== undefined) {
            if (dsLog.enabled) {
                const msgDirtyRelated = this.arrDirtyRelated.map(dr => dr.msg).join(", ");
                dsLog.info(`DS emitDirty to ${msgDirtyRelated}`)
            }
            for (const dirtyRelated of this.arrDirtyRelated) {
                dirtyRelated.valueStore.isDirty = true;
            }
        }
        for (const dirtyRelated of this.arrDirtyHandler) {
            if (dsLog.enabled) {
                dsLog.info(`DS emitDirty to ${dirtyRelated.msg}`)
            }
            dirtyRelated.handler(stateValue);
        }
    }

    public listenDirty(msg: string, callback: DSDirtyHandler<StateValue>): DSUnlisten {
        this.arrDirtyHandler.push({ msg: msg, handler: callback });
        return this.unlistenDirty.bind(this, callback);
    }

    public unlistenDirty(callback: DSDirtyHandler<StateValue>): void {
        this.arrDirtyHandler = this.arrDirtyHandler.filter((cb) => cb.handler !== callback);
    }

    public processDirty(): void {
    }

    public emitUIUpdate(uiStateValue: IDSUIStateValue<Value>) {
        if (this.storeManager === undefined) {
            uiStateValue.triggerUIUpdate();
        } else {
            this.storeManager.emitUIUpdate(uiStateValue);
        }
    }

    public emitEvent<
        Event extends DSEvent<any, string, StoreName>
    >(eventType: Event['event'], payload: Event['payload']): DSEventHandlerResult {
        const event = {
            storeName: this.storeName,
            event: eventType,
            payload: payload
        };
        if (this.storeManager === undefined) {
            return this.processEvent(event);
        } else {
            return this.storeManager.emitEvent(event);
        }
    }

    public listenEvent<
        Event extends DSEvent<any, string, StoreName>
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        const key = `${this.storeName}/${event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            this.mapEventHandlers.set(key, [{ msg: msg, handler: callback as DSEventHandler }]);
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.concat([{ msg: msg, handler: callback as DSEventHandler }]));
        }
        return this.unlistenEvent.bind(this, { storeName: this.storeName, event: event }, callback as DSEventHandler);
    }

    public listenEventAnyStore<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(msg: string, event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten {
        const key = `${event.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            this.mapEventHandlers.set(key, [{ msg: msg, handler: callback as DSEventHandler }]);
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.concat([{ msg: msg, handler: callback as DSEventHandler }]));
        }
        if ((event.storeName as string) === (this.storeName as string)) {
            // 'internal'
        } else {
            this.listenToAnyStore = true;
        }
        this.storeManager?.resetRegisteredEvents();
        return this.unlistenEvent.bind(this, { storeName: event.storeName, event: event.event }, callback as DSEventHandler);
    }

    public unlistenEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): void {
        const key = `${event.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            // should not be
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.filter(cb => cb.handler !== callback));
        }
    }

    public processEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>): DSEventHandlerResult {
        const key = `${event.storeName}/${event.event}`;
        let r: DSEventHandlerResult;
        let result: undefined | Promise<any>[];
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            // nobody is listening
            if (dsLog.enabled) {
                dsLog.info(`DS store.processEvent ${event.storeName}/${event.event} nobody is listening`);
            }
        } else {
            for (const { msg, handler: callback } of arrEventHandlers) {
                if (dsLog.enabled) {
                    dsLog.info(`DS store.processEvent ${event.storeName}/${event.event} with ${msg}`);
                }
                if (r === undefined) {
                    r = callback(event);
                } else {
                    r = r.catch((reason) => {
                        debugger;
                        console.error(reason);
                    }).then(
                        () => { return callback(event); }
                    );
                }
            }
        }
        if (r == undefined) {
            return;
        } else {
            return r.catch((reason) => {
                debugger;
                console.error(reason);
            });
        }
    }
}

export class DSObjectStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),
    StoreName extends string = string
    > extends DSValueStore<Value, StateValue> {
    readonly stateValue: StateValue
    constructor(
        storeName: StoreName,
        stateValue: StateValue,
        configuration?: ConfigurationDSValueStore<Value, StateValue>
    ) {
        super(storeName, configuration);
        this.stateValue = stateValue;
        stateValue.setStore(this);
    }

    public listenEventValue<Event extends DSEventValue<StateValue, never, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }
}

export class DSArrayStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),
    StoreName extends string = string
    > extends DSValueStore<Value, StateValue> {
    entities: StateValue[];
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSArrayValueStore<Value, StateValue>
    ) {
        super(storeName, configuration);
        this.entities = [];
    }

    public create(value: Value): StateValue {
        const create = (this.configuration as ConfigurationDSArrayValueStore<Value, StateValue>).create;
        if (create !== undefined) {
            const result = create(value);
            this.attach(result);
            return result;
        } else {
            const result = new DSStateValue<Value>(value) as unknown as StateValue;
            this.attach(result);
            return result;
        }
    }

    public attach(stateValue: StateValue): StateValue {
        if (stateValue.setStore(this)) {
            this.entities.push(stateValue);
            const index = this.entities.length - 1;
            this.emitEvent<DSEventAttach<StateValue, never, number, StoreName>>("attach", { entity: stateValue, index: index });
        }
        return stateValue;
    }

    public detach(stateValue: StateValue): void {
        const index = this.entities.findIndex((item) => item === stateValue);
        if (index < 0) {
            // do nothing
        } else {
            const oldValue = this.entities.splice(index, 1)[0];
            oldValue.store = undefined;
            this.emitEvent<DSEventDetach<StateValue, never, number, StoreName>>("detach", { entity: oldValue, index: index });
        }
    }

    public listenEventAttach<Event extends DSEventAttach<StateValue, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "attach", callback as any);
    }

    public listenEventValue<Event extends DSEventValue<StateValue, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventDetach<StateValue, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "detach", callback as any);
    }
}

export class DSMapStore<
    Key = Exclude<any, never>,
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),
    StoreName extends string = string
    > extends DSValueStore<Value, StateValue> {
    entities: Map<Key, StateValue>;
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSMapValueStore<Value, StateValue>
    ) {
        super(storeName, configuration);
        this.entities = new Map();
    }

    create(key: Key, value: Value): StateValue {
        const create = (this.configuration as ConfigurationDSMapValueStore<Value, StateValue>).create;
        if (create !== undefined) {
            const result = create(value);
            this.attach(key, result);
            return result;
        } else {
            const result = new DSStateValue<Value>(value) as unknown as StateValue;
            this.attach(key, result);
            return result;
        }
    }

    get(key: Key): (StateValue | undefined) {
        return this.entities.get(key);
    }

    attach(key: Key, stateValue: StateValue): (StateValue | undefined) {
        if (stateValue.setStore(this)) {
            const oldValue = this.entities.get(key);
            if (oldValue === undefined) {
                this.entities.set(key, stateValue);
                this.emitEvent<DSEventAttach<StateValue, Key, never, StoreName>>("attach", { entity: stateValue, key: key });
            } else if (oldValue === stateValue) {
                // do nothing
            } else {
                oldValue.store = undefined;
                this.emitEvent<DSEventDetach<StateValue, Key, never, StoreName>>("detach", { entity: oldValue, key: key });
                this.entities.set(key, stateValue);
                this.emitEvent<DSEventAttach<StateValue, Key, never, StoreName>>("attach", { entity: stateValue, key: key });
            }
            return oldValue;
        } else {
            return stateValue;
        }
    }

    detach(key: Key): void {
        const oldValue = this.entities.get(key);
        if (oldValue === undefined) {
            // do nothing
        } else {
            oldValue.store = undefined;
            this.emitEvent<DSEventDetach<StateValue, Key, never, StoreName>>("detach", { entity: oldValue, key: key });
        }
    }

    public listenEventAttach<Event extends DSEventAttach<StateValue, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "attach", callback as any);
    }

    public listenEventValue<Event extends DSEventValue<StateValue, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventDetach<StateValue, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "detach", callback as any);
    }
}

export class DSEntityStore<
    Key = any,
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),
    StoreName extends string = string
    > extends DSMapStore<Key, Value, StateValue>{
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSEntityValueStore<Key, Value, StateValue>
    ) {
        super(storeName, configuration);
    }

    public set(value: Value): StateValue {
        const getKey = (this.configuration as ConfigurationDSEntityValueStore<Key, Value, StateValue>).getKey;
        const create = (this.configuration as ConfigurationDSEntityValueStore<Key, Value, StateValue>).create;
        if (create !== undefined) {
            const result = create(value);
            const key = getKey(value);
            this.attach(key, result);
            return result;
        } else {
            const result = new DSStateValue<Value>(value) as unknown as StateValue;
            const key = getKey(value);
            this.attach(key, result);
            return result;
        }
    }

    public setMany(values: Value[]) {
        values.forEach(this.set, this);
    }

}