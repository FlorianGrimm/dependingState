import {
    ArrayElement,
    ConfigurationDSValueStore,
    DSEventEntityVSValueHandler,
    DSUnlisten,
    IDSObjectStore,
    IDSStateValue,
    IDSValueStore
} from "./types";

import { DSValueStore } from "./DSValueStore";

export class DSObjectStore<
    Value,
    StoreName extends string = string
    > extends DSValueStore<"stateValue", Value, StoreName>
    implements IDSObjectStore<Value, StoreName>    {
    readonly stateValue: IDSStateValue<Value>
    constructor(
        storeName: StoreName,
        stateValue: IDSStateValue<Value>,
        configuration?: ConfigurationDSValueStore<Value>
    ) {
        super(storeName, configuration);
        this.stateValue = stateValue;
        stateValue.setStore(this);
    }

    public getEntities(): { key: "stateValue"; stateValue: IDSStateValue<Value>; }[] {
        return [{ key: "stateValue", stateValue: this.stateValue }];
    }

    public listenEventValue(msg: string, callback: DSEventEntityVSValueHandler<Value, StoreName>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }
}