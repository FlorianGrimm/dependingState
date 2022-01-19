import {
    ConfigurationDSMapValueStore,
    IDSMapStore,
    IDSStateValue,
    DSEventEntityVSAttach,
    DSEventEntitySVDetach,
    DSEventEntityVSValue,
    DSEventHandler,
    DSUnlisten,
} from "./types";

import { DSValueStore } from "./DSValueStore";
import { DSStateValue } from "./DSStateValue";

export class DSMapStore<
    Key,
    Value,
    StoreName extends string = string
    > extends DSValueStore<Key, Value, StoreName> implements IDSMapStore<Key, Value, StoreName> {
    entities: Map<Key, IDSStateValue<Value>>;
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSMapValueStore<Value>
    ) {
        super(storeName, configuration);
        this.entities = new Map();
    }

    create(key: Key, value: Value): IDSStateValue<Value> {
        const create = (this.configuration as ConfigurationDSMapValueStore<Value>).create;
        if (create !== undefined) {
            const result = create(value);
            this.attach(key, result);
            return result;
        } else {
            const result = new DSStateValue<Value>(value);
            this.attach(key, result);
            return result;
        }
    }

    get(key: Key): (IDSStateValue<Value> | undefined) {
        return this.entities.get(key);
    }

    public getEntities(): { key: Key; stateValue: IDSStateValue<Value>; }[] {
        return Array.from(this.entities.entries()).map((e) => ({ key: e[0], stateValue: e[1] }));
    }

    attach(key: Key, stateValue: IDSStateValue<Value>): (IDSStateValue<Value> | undefined) {
        if (stateValue.setStore(this)) {
            const oldValue = this.entities.get(key);
            if (oldValue === undefined) {
                this.entities.set(key, stateValue);
                this.emitEvent<DSEventEntityVSAttach<Value, Key, never, StoreName>>("attach", { entity: stateValue, key: key });
            } else if (oldValue === stateValue) {
                // do nothing
            } else {
                oldValue.store = undefined;
                this.emitEvent<DSEventEntitySVDetach<Value, Key, never, StoreName>>("detach", { entity: oldValue, key: key });
                this.entities.set(key, stateValue);
                this.emitEvent<DSEventEntityVSAttach<Value, Key, never, StoreName>>("attach", { entity: stateValue, key: key });
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
            this.emitEvent<DSEventEntitySVDetach<Value, Key, never, StoreName>>("detach", { entity: oldValue, key: key });
        }
    }

    public listenEventAttach<Event extends DSEventEntityVSAttach<Value, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "attach", callback as any);
    }

    public listenEventValue<Event extends DSEventEntityVSValue<Value, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventEntitySVDetach<IDSStateValue<Value>, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
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
