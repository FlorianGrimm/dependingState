import type {
    DSDirtyHandler,
    DSEvent, DSEventHandler, DSEventHandlerResult, DSPayloadEntity, DSUnlisten
} from './types'

import type {
    DSStoreManager
} from './DSStoreManager';

import {
    IDSStateValue
} from './DSStateValue';
import { DSEventName } from '.';
import { DSUIStateValue } from './DSUIStateValue';
//, StoreName extends string = string
export class DSValueStore<Value = any, StateValue extends IDSStateValue<Value> = IDSStateValue<Value>>{
    storeName: string;
    storeManager: DSStoreManager | undefined;
    mapEventHandlers: Map<string, DSEventHandler[]>;
    arrDirtyHandler: DSDirtyHandler<Value>[];
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

    emitDirty(stateValue: StateValue) {
        for (const cb of this.arrDirtyHandler) {
            cb(stateValue);
        }
    }

    listenDirty(callback: DSDirtyHandler<Value>): DSUnlisten {
        this.arrDirtyHandler.push(callback);
        return this.unlistenDirty.bind(this, callback);
    }

    unlistenDirty(callback: DSDirtyHandler<Value>) {
        this.arrDirtyHandler = this.arrDirtyHandler.filter((cb) => cb !== callback);
    }

    processDirty(): boolean {
        if (this.isDirty) {
            this.isDirty = false;
            return true;
        } else {
            return false;
        }
    }

    emitUIUpdate(uiStateValue: DSUIStateValue<Value>) {
        if (this.storeManager === undefined) {
            uiStateValue.triggerUIUpdate();
        } else {
            this.storeManager.emitUIUpdate(uiStateValue);
        }
    }

    emitEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>) {
        if (this.storeManager === undefined) {
            this.processEvent(event);
        } else {
            this.storeManager.emitEvent(event);
        }
    }

    listenEvent<
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

    unlistenEvent<
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

    processEvent<
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

export class DSObjectStore<Value = any, StateValue extends IDSStateValue<Value> = IDSStateValue<Value>> extends DSValueStore<Value, StateValue> {
    stateValue: StateValue
    constructor(storeName: string, stateValue: StateValue) {
        super(storeName);
        this.stateValue = stateValue;
        // tbd test
        this.stateValue.store = this;
    }
}

export class DSArrayStore<Value = any, StateValue extends IDSStateValue<Value> = IDSStateValue<Value>> extends DSValueStore<Value, StateValue> {
    entities: IDSStateValue<Value>[];
    constructor(storeName: string) {
        super(storeName);
        this.entities = [];
    }

    create(value: Value): IDSStateValue<Value> {
        const result = new DSStateValue<Value>(value);
        this.attach(result);
        return result;
    }

    attach(stateValue: IDSStateValue<Value>): IDSStateValue<Value> {
        if (stateValue.store === this) {
            return stateValue;
        }
        if (stateValue.store !== undefined) {
            throw "already attached";
        }
        stateValue.store = this;
        this.entities.push(stateValue);
        this.emitEvent<DSPayloadEntity<Value, never, number>>(
            {
                storeName: this.storeName,
                event: "attach",
                payload: {
                    entity: stateValue,
                    index: this.entities.length - 1
                }
            });
        return stateValue;
    }

    detach(stateValue: IDSStateValue<Value>): void {
        const idx = this.entities.findIndex((item) => item === stateValue);
        if (idx < 0) {
            // do nothing
        } else {
            const oldValue = this.entities.splice(idx, 1)[0];
            oldValue.store = undefined;
            this.emitEvent<DSPayloadEntity<Value>>({ storeName: this.storeName, event: "detach", payload: { entity: oldValue, index: idx } });
        }
    }
}

export class DSMapStore<Key = any, Value = any, StateValue extends IDSStateValue<Value> = IDSStateValue<Value>> extends DSValueStore<Value, StateValue> {
    entities: Map<Key, IDSStateValue<Value>>;
    constructor(storeName: string) {
        super(storeName);
        this.entities = new Map();
    }

    create(key: Key, value: Value): IDSStateValue<Value> {
        const result = new DSStateValue<Value>(value);
        this.attach(key, result);
        return result;
    }

    get(key: Key): (IDSStateValue<Value> | undefined) {
        return this.entities.get(key);
    }

    attach(key: Key, stateValue: IDSStateValue<Value>): (IDSStateValue<Value> | undefined) {
        if (stateValue.store === this) {
            return stateValue;
        }
        if (stateValue.store !== undefined) {
            throw "already attached";
        }
        if (stateValue.store === this) {
            return this;
        } else if (stateValue.store === undefined) {
            stateValue.store = this;
        } else {
            throw "already attached."
        }
        const oldValue = this.entities.get(key);
        if (oldValue === undefined) {
            this.entities.set(key, stateValue);
            this.emitEvent<DSPayloadEntity<Value>>({ storeName: this.storeName, event: "attach", payload: { entity: stateValue, key: key } });
        } else if (oldValue === stateValue) {
            // do nothing
        } else {
            oldValue.store = undefined;
            this.emitEvent<DSPayloadEntity<Value>>({ storeName: this.storeName, event: "detach", payload: { entity: oldValue, key: key } });
            this.entities.set(key, stateValue);
            this.emitEvent<DSPayloadEntity<Value>>({ storeName: this.storeName, event: "attach", payload: { entity: stateValue, key: key } });
        }
        return oldValue;
    }

    detach(key: Key): void {
        const oldValue = this.entities.get(key);
        if (oldValue === undefined) {
            // do nothing
        } else {
            oldValue.store = undefined;
            this.emitEvent<DSPayloadEntity<Value>>({ storeName: this.storeName, event: "detach", payload: { entity: oldValue, key: key } });
        }
    }
}

export class DSEntityStore<Key = any, Value = any, StateValue extends IDSStateValue<Value> = IDSStateValue<Value>> extends DSMapStore<Key, Value, StateValue>{
    constructor(
        storeName: string,
        public fnCreate: (Value: Value) => StateValue,
        public fnGetKey: (value: Value) => Key
    ) {
        super(storeName);
    }

    public set(value: Value): StateValue {
        const result = this.fnCreate(value);
        const key = this.fnGetKey(value);
        this.attach(key, result);
        return result;
    }

    public setMany(values: Value[]) {
        values.forEach(this.set, this);
    }

}