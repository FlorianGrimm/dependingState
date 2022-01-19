import {
    ConfigurationDSArrayValueStore,
    DSEventEntityVSAttach,
    DSEventEntitySVDetach,
    DSEventHandler,
    DSEventEntityVSValue,
    IDSArrayStore,
    IDSStateValue,
    DSUnlisten
} from "./types";

import { DSValueStore } from "./DSValueStore";
import { DSStateValue } from "./DSStateValue";

export class DSArrayStore<
    Value = any,
    StoreName extends string = string
    > extends DSValueStore<number, Value, StoreName> implements IDSArrayStore<number, Value, StoreName>    {
    entities: IDSStateValue<Value>[];
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSArrayValueStore<Value>
    ) {
        super(storeName, configuration);
        this.entities = [];
    }

    public getEntities(): { key: number; stateValue: IDSStateValue<Value>; }[] {
        return this.entities.map((e, index) => ({ key: index, stateValue: e }));
    }

    public create(value: Value): IDSStateValue<Value> {
        const create = (this.configuration as ConfigurationDSArrayValueStore<Value>).create;
        if (create !== undefined) {
            const result = create(value);
            this.attach(result);
            return result;
        } else {
            const result = new DSStateValue<Value>(value);
            this.attach(result);
            return result;
        }
    }

    public attach(stateValue: IDSStateValue<Value>): void {
        if (stateValue.setStore(this)) {
            this.entities.push(stateValue);
            const index = this.entities.length - 1;
            this.emitEvent<DSEventEntityVSAttach<Value, never, number, StoreName>>("attach", { entity: stateValue, index: index });
        }
    }

    public detach(stateValue: IDSStateValue<Value>): void {
        const index = this.entities.findIndex((item) => item === stateValue);
        if (index < 0) {
            // do nothing
        } else {
            const oldValue = this.entities.splice(index, 1)[0];
            oldValue.store = undefined;
            this.emitEvent<DSEventEntitySVDetach<Value, never, number, StoreName>>("detach", { entity: oldValue, index: index });
        }
    }

    public listenEventAttach<Event extends DSEventEntityVSAttach<Value, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "attach", callback as any);
    }

    public listenEventValue<Event extends DSEventEntityVSValue<Value, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventEntitySVDetach<Value, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
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