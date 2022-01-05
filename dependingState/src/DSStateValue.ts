import type {
    DSValueStore
} from "./DSValueStore";

import { DSUIStateValue } from "./DSUIStateValue";

export class DSStateValue<Value>{
    _value: Value;
    store: DSValueStore<Value> | undefined;
    stateVersion: number;
    uiStateValue: DSUIStateValue<Value> | undefined;

    constructor(value: Value) {
        this._value = value;
        this.store = undefined;
        this.stateVersion = 1;
        this.uiStateValue = undefined;
    }

    public get value(): Value {
        return this._value;
    }

    public set value(v: Value) {
        this._value = v;
        this.valueChanged();
    }

    public valueChanged() {
        if (this.store !== undefined) {
            this.stateVersion = this.store.getNextStateVersion(this.stateVersion);
            this.store.emit<DSStateValue<Value>>({ storeName: this.store.storeName, event: "value", payload: this });
        }
        // delay or not??
        if (this.uiStateValue !== undefined){
            this.uiStateValue.triggerUIUpdate();
        }
    }

    public getUIStateValue(): DSUIStateValue<Value> {
        if (this.uiStateValue === undefined) {
            return this.uiStateValue = new DSUIStateValue<Value>(this);
        } else {
            return this.uiStateValue;
        }
    }
}
