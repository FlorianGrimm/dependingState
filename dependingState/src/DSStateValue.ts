import type {
    DSValueStore
} from "./DSValueStore";

import { DSUIStateValue } from "./DSUIStateValue";
import { DSPayloadEntity } from "./types";

export class DSStateValue<Value>{
    private _value: Value;
    isDirty: boolean;
    store: DSValueStore<Value> | undefined;
    stateVersion: number;
    uiStateValue: DSUIStateValue<Value> | undefined;

    constructor(value: Value) {
        this._value = value;
        this.isDirty = false;
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
        this.isDirty = false;
        if (this.store !== undefined) {
            this.stateVersion = this.store.getNextStateVersion(this.stateVersion);
            this.store.emitDirty(this);
            this.store.emitEvent<DSPayloadEntity<Value>>({ storeName: this.store.storeName, event: "value", payload: {entity: this} });
        }
        if (this.uiStateValue !== undefined) {
            if (this.store === undefined) {
                this.uiStateValue.triggerUIUpdate();
            } else {
                this.store.emitUIUpdate(this.uiStateValue);
            }
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
