import {
    ArrayElement,
    ConfigurationDSValueStore,
    DSEventValueHandler,
    DSUnlisten,
    IDSObjectStore,
    IDSStateValue,
    IDSValueStore
} from "./types";

import { DSValueStore } from "./DSValueStore";

export class DSObjectStore<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends DSValueStore<StateValue, "stateValue", Value, StoreName>
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

    public getEntities(): { key: "stateValue"; stateValue: StateValue; }[] {
        return [{ key: "stateValue", stateValue: this.stateValue }];
    }

    public listenEventValue(msg: string, callback: DSEventValueHandler<StateValue, StoreName, Value>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    /*
    public combineValueStateFromObjectStore<
        OtherValueStore extends IDSObjectStore<OtherStateValue, OtherValue, OtherStoreName>,
        PropertyName extends keyof StateValue,
        OtherStateValue extends IDSStateValue<OtherValue> = ArrayElement<ReturnType<OtherValueStore["getEntities"]>>['stateValue'],
        //OtherKey = ArrayElement<ReturnType<OtherValueStore["getEntities"]>>['key'],
        OtherValue =  ArrayElement<ReturnType<OtherValueStore["getEntities"]>>['stateValue']['value'],
        OtherStoreName extends string = OtherValueStore['storeName']
        >(
            name: PropertyName,
            getStore: (() => OtherValueStore)
        ) {
        const store = getStore();
        (this.stateValue as any)[name] = store.stateValue;
        (this.stateValue as any)[`${name}StateVerion`] = store.stateVersion;
        store.listenDirtyRelated(this.storeName, this);
        store.listenEventValue("", (e) => {
            this.processDirty();
        })
    }
    */
}