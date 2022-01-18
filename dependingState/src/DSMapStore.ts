import {
    ConfigurationDSMapValueStore,
    IDSMapStore,
    IDSStateValue,
    DSEventAttach,
    DSEventDetach,
    DSEventValue,
    DSEventHandler,
    DSUnlisten,
} from "./types";

import { DSValueStore } from "./DSValueStore";
import { DSStateValue } from "./DSStateValue";

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

    public getEntities(): { key: Key; stateValue: StateValue; }[] {
        return Array.from(this.entities.entries()).map((e) => ({ key: e[0], stateValue: e[1] }));
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
