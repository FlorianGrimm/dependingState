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
} from './types'

import {
    DSStateValue
} from './DSStateValue';

//, StoreName extends string = string
export class DSValueStore<
    Value,
    StateValue extends IDSStateValue<Value>
    > implements IDSValueStore<Value, StateValue>{
    storeName: string;
    storeManager: IDSStoreManager | undefined;
    mapEventHandlers: Map<string, DSEventHandler[]>;
    arrDirtyHandler: DSDirtyHandler<StateValue>[];
    isDirty: boolean;

    constructor(storeName: string) {
        this.storeName = storeName;
        this.storeManager = undefined;
        this.mapEventHandlers = new Map();
        this.arrDirtyHandler = [];
        this.isDirty = false;
    }

    public getNextStateVersion(stateVersion: number): number {
        if (this.storeManager === undefined) {
            //return (stateVersion & (Number.MAX_SAFE_INTEGER - 1)) + 1;
            return stateVersion + 1;
        } else {
            return this.storeManager.getNextStateVersion(stateVersion);
        }
    }

    public emitDirty(stateValue: StateValue): void {
        for (const cb of this.arrDirtyHandler) {
            cb(stateValue);
        }
    }

    public listenDirty(callback: DSDirtyHandler<StateValue>): DSUnlisten {
        this.arrDirtyHandler.push(callback);
        return this.unlistenDirty.bind(this, callback);
    }

    public unlistenDirty(callback: DSDirtyHandler<StateValue>): void {
        this.arrDirtyHandler = this.arrDirtyHandler.filter((cb) => cb !== callback);
    }

    public processDirty(): boolean {
        if (this.isDirty) {
            this.isDirty = false;
            return true;
        } else {
            return false;
        }
    }

    public emitUIUpdate(uiStateValue: IDSUIStateValue<Value>) {
        if (this.storeManager === undefined) {
            uiStateValue.triggerUIUpdate();
        } else {
            this.storeManager.emitUIUpdate(uiStateValue);
        }
    }

    public emitEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>): DSEventHandlerResult {
        if (this.storeManager === undefined) {
            return this.processEvent(event);
        } else {
            return this.storeManager.emitEvent(event);
        }
    }

    public listenEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten {
        const key = `${event.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            this.mapEventHandlers.set(key, [callback as DSEventHandler]);
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.concat([callback as DSEventHandler]));
        }
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
            this.mapEventHandlers.set(key, arrEventHandlers.filter(cb => cb !== callback));
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
        } else {
            for (const callback of arrEventHandlers) {
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
    //StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>)
    StateValue extends IDSStateValue<Value> = IDSStateValue<Value>
    > extends DSValueStore<Value, StateValue> {
    stateValue: StateValue
    constructor(storeName: string, stateValue: StateValue) {
        super(storeName);
        this.stateValue = stateValue;
        stateValue.setStore(this);
    }
}

export class DSArrayStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = IDSStateValue<Value>
    > extends DSValueStore<Value, StateValue> {
    entities: StateValue[];
    constructor(
        storeName: string,
        fnCreate?: ((value: Value) => StateValue)
    ) {
        super(storeName);
        this.entities = [];
        if (fnCreate !== undefined) {
            this.create = fnCreate;
        }
    }

    create(value: Value): StateValue {
        const result = new DSStateValue<Value>(value) as unknown as StateValue;
        this.attach(result);
        return result;
    }

    attach(stateValue: StateValue): StateValue {
        if (stateValue.setStore(this)) {
            this.entities.push(stateValue);
            const index = this.entities.length - 1;
            this.emitEvent<DSPayloadEntity<StateValue, never, number>>(
                {
                    storeName: this.storeName,
                    event: "attach",
                    payload: {
                        entity: stateValue,
                        index: index
                    }
                });
        }
        return stateValue;
    }

    detach(stateValue: StateValue): void {
        const idx = this.entities.findIndex((item) => item === stateValue);
        if (idx < 0) {
            // do nothing
        } else {
            const oldValue = this.entities.splice(idx, 1)[0];
            oldValue.store = undefined;
            this.emitEvent<DSPayloadEntity<StateValue, never, number>>({
                storeName: this.storeName,
                event: "detach",
                payload: {
                    entity: oldValue,
                    index: idx
                }
            });
        }
    }
}

export class DSMapStore<
    Key = Exclude<any, never>,
    Value = Exclude<any, never>,
    StateValue extends IDSStateValue<Value> = IDSStateValue<Value>
    > extends DSValueStore<Value, StateValue> {
    entities: Map<Key, StateValue>;
    constructor(
        storeName: string,
        public fnCreate?: ((value: Value) => StateValue)
    ) {
        super(storeName);
        this.entities = new Map();
    }

    create(key: Key, value: Value): StateValue {
        const result = (this.fnCreate !== undefined)
            ? this.fnCreate(value)
            : new DSStateValue<Value>(value) as unknown as StateValue;
        this.attach(key, result);
        return result;
    }

    get(key: Key): (StateValue | undefined) {
        return this.entities.get(key);
    }

    attach(key: Key, stateValue: StateValue): (StateValue | undefined) {
        if (stateValue.setStore(this)) {
            const oldValue = this.entities.get(key);
            if (oldValue === undefined) {
                this.entities.set(key, stateValue);
                this.emitEvent<DSPayloadEntity<StateValue>>({
                    storeName: this.storeName,
                    event: "attach",
                    payload: { entity: stateValue, key: key }
                });
            } else if (oldValue === stateValue) {
                // do nothing
            } else {
                oldValue.store = undefined;

                this.emitEvent<DSPayloadEntity<StateValue>>({
                    storeName: this.storeName,
                    event: "detach",
                    payload: { entity: oldValue, key: key }
                });
                this.entities.set(key, stateValue);
                this.emitEvent<DSPayloadEntity<Value>>({
                    storeName: this.storeName,
                    event: "attach",
                    payload: { entity: stateValue.value, key: key }
                });
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
            this.emitEvent<DSPayloadEntity<StateValue>>({
                storeName: this.storeName,
                event: "detach",
                payload: { entity: oldValue, key: key }
            });
        }
    }
}

export class DSEntityStore<
    Key = any,
    Value = any,
    StateValue extends IDSStateValue<Value> = IDSStateValue<Value>
    > extends DSMapStore<Key, Value, StateValue>{
    constructor(
        storeName: string,
        fnCreate: (Value: Value) => StateValue,
        public fnGetKey: (value: Value) => Key
    ) {
        super(storeName, fnCreate);
    }

    public set(value: Value): StateValue {
        const result = (this.fnCreate !== undefined)
            ? this.fnCreate(value)
            : new DSStateValue<Value>(value) as unknown as StateValue;
        const key = this.fnGetKey(value);
        this.attach(key, result);
        return result;
    }

    public setMany(values: Value[]) {
        values.forEach(this.set, this);
    }

}