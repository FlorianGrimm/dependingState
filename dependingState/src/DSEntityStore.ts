import {
    ConfigurationDSEntityValueStore,
    IDSStateValue
} from "./types";

import { DSMapStore } from "./DSMapStore";
import { DSStateValue } from "./DSStateValue";

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