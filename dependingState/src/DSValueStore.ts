import type {
    DSDirtyHandler,
    DSEvent,
    DSEventHandler,
    DSEventHandlerResult,
    DSUnlisten,
    DSEventName,
    IDSValueStore,
    IDSStateValue,
    IDSStoreManager,
    IDSUIStateValue,
    ConfigurationDSValueStore,
    ConfigurationDSArrayValueStore,
    ConfigurationDSMapValueStore,
    ConfigurationDSEntityValueStore,
    DSEventValue,
    DSEventAttach,
    DSEventDetach,
    IDSStoreBuilder,
    IDSObjectStore,
    DSEventValueHandler,
    IDSAnyValueStore,
    IDSArrayStore,
    IDSMapStore,
    ArrayElement
} from './types'

import {
    DSStateValue
} from './DSStateValue';

import {
    dsLog
} from './DSLog';

export class DSValueStore<
    StateValue extends IDSStateValue<Value>,
    Key,
    Value, // = StateValue['value'],
    StoreName extends string // = string
    > implements IDSValueStore<StateValue, Key, Value, StoreName>{
    private _isDirty: boolean;
    storeName: StoreName;
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    listenToAnyStore: boolean;
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler<any, string, string> }[]>;
    arrDirtyHandler: { msg: string, handler: DSDirtyHandler<StateValue, Value> }[];
    arrDirtyRelated: { msg: string, valueStore: IDSAnyValueStore }[] | undefined;
    setEffectiveEvents: Set<string> | undefined;
    enableEmitDirtyFromValueChanged: boolean;
    configuration: ConfigurationDSValueStore<StateValue, Value>;
    storeBuilder: IDSStoreBuilder<StoreName> | undefined;

    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSValueStore<StateValue, Value>
    ) {
        this.storeName = storeName;
        this.storeManager = undefined;
        this.listenToAnyStore = false;
        this.mapEventHandlers = new Map();
        this.arrDirtyHandler = [];
        this._isDirty = false;
        this.stateVersion = 1;
        this.enableEmitDirtyFromValueChanged = false;

        if (configuration === undefined) {
            this.configuration = {};
        } else {
            this.configuration = { ...configuration };
        }
    }

    public get isDirty(): boolean {
        return this._isDirty;
    }

    public set isDirty(value: boolean) {
        if (this._isDirty == value) {
            //
        } else {
            this._isDirty = value;
            if (value) {
                dsLog.infoACME("DS", "DSValueStore", "isDirty", this.storeName, "true");
            } else {
                //dsLog.infoACME("DS", "DSValueStore", "isDirty", this.storeName, "false");
            }
        }
    }

    public setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void {
        if (this.storeBuilder !== undefined) {
            throw new Error(`DS storeBuilder is already set ${this.storeName}`);
        }
        this.storeBuilder = storeBuilder;
        storeBuilder.bindValueStore(this);
    }

    public postAttached(): void {
        this.stateVersion = this.storeManager!.getNextStateVersion(0);
        if (this.configuration.postAttached !== undefined) {
            this.configuration.postAttached();
        }
    }

    public getNextStateVersion(stateVersion: number): number {
        if (this.storeManager === undefined) {
            return (this.stateVersion = (Math.max(this.stateVersion, stateVersion) + 1));
        } else {
            return (this.stateVersion = this.storeManager.getNextStateVersion(stateVersion));
        }
    }

    public getEntities():{key:Key, stateValue:StateValue}[]{
        return [];
    }

    public listenDirtyRelated<
        RelatedValueStore extends IDSValueStore<RelatedStateValue, RelatedKey, RelatedValue, RelatedStoreName>,
        RelatedStateValue extends IDSStateValue<RelatedValue> = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue'],
        RelatedKey = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['key'],
        RelatedValue =  ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue']['value'],
        RelatedStoreName extends string = RelatedValueStore['storeName']
    >(msg: string, relatedValueStore: RelatedValueStore): DSUnlisten {
        if (this.arrDirtyRelated === undefined) {
            this.arrDirtyRelated = [];
        }
        const index = this.arrDirtyRelated.findIndex((item) => (item.valueStore === relatedValueStore));
        if (index < 0) {
            this.arrDirtyRelated = (this.arrDirtyRelated || []).concat([{ msg: msg, valueStore: relatedValueStore }]);
            return (()=>{this.unlistenDirtyRelated<RelatedValueStore, RelatedStateValue, RelatedKey, RelatedValue, RelatedStoreName>(relatedValueStore);});
            //.bind(this, relatedValueStore);
        } else {
            return (() => { });
        }
    }

    public unlistenDirtyRelated<
        RelatedValueStore extends IDSValueStore<RelatedStateValue, RelatedKey, RelatedValue, RelatedStoreName>,
        RelatedStateValue extends IDSStateValue<RelatedValue> = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue'],
        RelatedKey = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['key'],
        RelatedValue =  ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue']['value'],
        RelatedStoreName extends string = RelatedValueStore['storeName']
    >(relatedValueStore: RelatedValueStore): void {
        if (this.arrDirtyRelated !== undefined) {
            this.arrDirtyRelated = this.arrDirtyRelated.filter((item) => (item.valueStore !== relatedValueStore));
            if (this.arrDirtyRelated.length === 0) {
                this.arrDirtyRelated = undefined;
            }
        }
    }

    public emitDirtyFromValueChanged(stateValue?: StateValue, properties?: Set<keyof Value>): void {
        if (this.enableEmitDirtyFromValueChanged) {
            this.emitDirty(stateValue, properties);
        }
    }

    public emitDirty(stateValue?: StateValue, properties?: Set<keyof Value>): void {
        if (dsLog.enabled) {
            dsLog.infoACME("DS", "DSValueStore", "emitDirty", this.storeName);
        }
        if (this.arrDirtyRelated !== undefined) {
            if (dsLog.enabled) {
                const msgDirtyRelated = this.arrDirtyRelated.map(dr => dr.msg).join(", ");
                dsLog.infoACME("DS", "DSValueStore", "emitDirty", msgDirtyRelated, "/DirtyRelated");
            }
            for (const dirtyRelated of this.arrDirtyRelated) {
                dirtyRelated.valueStore.isDirty = true;
            }
        }
        for (const dirtyHandler of this.arrDirtyHandler) {
            if (dsLog.enabled) {
                dsLog.infoACME("DS", "DSValueStore", "emitDirty", dirtyHandler.msg, "/dirtyHandler");
            }
            dirtyHandler.handler(stateValue, properties);
        }
    }

    public listenDirty(msg: string, callback: DSDirtyHandler<StateValue, Value>): DSUnlisten {
        this.arrDirtyHandler.push({ msg: msg, handler: callback });
        return this.unlistenDirty.bind(this, callback);
    }

    public unlistenDirty(callback: DSDirtyHandler<StateValue, Value>): void {
        this.arrDirtyHandler = this.arrDirtyHandler.filter((cb) => cb.handler !== callback);
    }

    public processDirty(): void {
        this.isDirty = false;
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
                dsLog.infoACME("DS", "DSValueStore", "processEvent", `${event.storeName}/${event.event}`, "/nobody is listening");
            }
        } else {
            for (const { msg, handler: callback } of arrEventHandlers) {
                if (dsLog.enabled) {
                    dsLog.infoACME("DS", "DSValueStore", "processEvent", `${event.storeName}/${event.event}`, `/with ${msg}`);
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
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends DSValueStore<StateValue, undefined, Value, StoreName>
    implements IDSObjectStore<StateValue, Value, StoreName>    {
    readonly stateValue: StateValue
    constructor(
        storeName: StoreName,
        stateValue: StateValue,
        configuration?: ConfigurationDSValueStore<StateValue, Value>
    ) {
        super(storeName, configuration);
        this.stateValue = stateValue;
        stateValue.setStore(this);
    }

    public listenEventValue(msg: string, callback: DSEventValueHandler<StateValue, StoreName, Value>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public combineValueStateFromObjectStore<
        OtherStore extends IDSObjectStore<OtherStateValue, OtherValue, OtherStoreName>,
        PropertyName extends keyof StateValue,
        OtherValue = any,
        OtherStateValue extends IDSStateValue<OtherValue> = IDSStateValue<OtherValue>,
        OtherStoreName extends string = string,
        >(
            name: PropertyName,
            getStore: (() => OtherStore)
        ) {
        const store = getStore();
        (this.stateValue as any)[name] = store.stateValue;
        (this.stateValue as any)[`${name}StateVerion`] = store.stateVersion;
        store.listenDirtyRelated(this.storeName, this);
        store.listenEventValue("", (e) => {
            this.processDirty();
        })
    }
}

export class DSArrayStore<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends DSValueStore<StateValue, number, Value, StoreName> implements IDSArrayStore<StateValue, number, Value, StoreName>    {
    entities: StateValue[];
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSArrayValueStore<StateValue, Value>
    ) {
        super(storeName, configuration);
        this.entities = [];
    }

    public getStateValue(key: number): (StateValue | undefined) {
        return undefined;
    }
    public getKeyOf(stateValue: StateValue): (number | undefined){
        return undefined;
    }

    public create(value: Value): StateValue {
        const create = (this.configuration as ConfigurationDSArrayValueStore<StateValue, Value>).create;
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

    public listenEventValue<Event extends DSEventValue<StateValue, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventDetach<StateValue, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "detach", callback as any);
    }

    /*
    public processDirty(): void {
        for (const entity of this.entities) {
            entity.processDirty();
        }
    }
    */
}

export class DSMapStore<
    StateValue extends IDSStateValue<Value>,
    Key = string,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends DSValueStore<StateValue, Key, Value, StoreName> implements IDSMapStore<StateValue, Key, Value, StoreName> {
    entities: Map<Key, StateValue>;
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSMapValueStore<StateValue, Value>
    ) {
        super(storeName, configuration);
        this.entities = new Map();
    }

    create(key: Key, value: Value): StateValue {
        const create = (this.configuration as ConfigurationDSMapValueStore<StateValue, Value>).create;
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

    public listenEventValue<Event extends DSEventValue<StateValue, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventDetach<StateValue, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "detach", callback as any);
    }

    /*
    public processDirty(): void {
        for (const entity of this.entities.values()) {
            entity.processDirty();
        }
    }
    */
}

export class DSEntityStore<
    StateValue extends IDSStateValue<Value>,
    Key = string,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends DSMapStore<StateValue, Key, Value, StoreName>{
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSEntityValueStore<StateValue, Key, Value>
    ) {
        super(storeName, configuration);
    }

    public set(value: Value): StateValue {
        const getKey = (this.configuration as ConfigurationDSEntityValueStore<StateValue, Key, Value>).getKey;
        const create = (this.configuration as ConfigurationDSEntityValueStore<StateValue, Key, Value>).create;
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