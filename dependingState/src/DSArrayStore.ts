import {
    ConfigurationDSArrayValueStore,
    DSEventAttach,
    DSEventDetach,
    DSEventHandler,
    DSEventValue,
    IDSArrayStore,
    IDSStateValue,
    DSUnlisten
} from "./types";

import { DSValueStore } from "./DSValueStore";
import { DSStateValue } from "./DSStateValue";

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

    public getEntities(): { key: number; stateValue: StateValue; }[] {
        return this.entities.map((e, index) => ({ key: index, stateValue: e }));
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