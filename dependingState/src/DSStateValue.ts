import type {
    DSValueStore
} from "./DSValueStore";

import {
    IDSStateValue,
    DSPayloadEntity,
    IDSValueStore,
    DSUIProps
} from "./types";
import { DSUIStateValue } from "./DSUIStateValue";


export class DSStateValue<Value> implements IDSStateValue<Value>{
    private _value: Value;
    isDirty: boolean;
    store: IDSValueStore<Value> | undefined;
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
            this.store.emitEvent<DSPayloadEntity<DSStateValue<Value>>>({ storeName: this.store.storeName, event: "value", payload: { entity: this } });
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

    public setStore(store: IDSValueStore<Value>): boolean {
        if (this.store === undefined) {
            this.store = store;
            return true;
        } else if (this.store === store) {
            // ignore
            return false;
        } else {
            throw new Error("store already set.");
        }
    }

    public getViewProps(): DSUIProps<Value> {
        return this.getUIStateValue().getViewProps();
    }

    public triggerUIUpdate(): void {
        if (this.uiStateValue === undefined) {
            // ignore
        } else {
            return this.uiStateValue.triggerUIUpdate();
        }
    }

    public get triggerScheduled(): boolean {
        if (this.uiStateValue === undefined) {
            return false;
        } else {
            return this.uiStateValue.triggerScheduled;
        }
    }


    public set triggerScheduled(value: boolean) {
        if (this.uiStateValue === undefined) {
        } else {
            this.uiStateValue.triggerScheduled = value;
        }
    }
}

export function stateValue<Value>(value: Value) {
    return new DSStateValue<Value>(value);
}

export class DSStateValueSelf<Value extends DSStateValueSelf<Value>> implements IDSStateValue<Value>{
    isDirty: boolean;
    store: IDSValueStore<Value> | undefined;
    stateVersion: number;
    uiStateValue: DSUIStateValue<Value> | undefined;

    constructor() {
        this.isDirty = false;
        this.store = undefined;
        this.stateVersion = 1;
        this.uiStateValue = undefined;
    }

    public get value(): Value {
        return this as unknown as Value;
    }

    public valueChanged() {
        this.isDirty = false;
        if (this.store !== undefined) {
            this.stateVersion = this.store.getNextStateVersion(this.stateVersion);
            this.store.emitDirty(this);
            this.store.emitEvent<DSPayloadEntity<Value>>({ storeName: this.store.storeName, event: "value", payload: { entity: this as any } });
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

    public setStore(store: IDSValueStore<Value>): boolean {
        if (this.store === undefined) {
            this.store = store;
            return true;
        } else if (this.store === store) {
            // ignore
            return false;
        } else {
            throw new Error("store already set.");
        }
    }

    public getViewProps(): DSUIProps<Value> {
        return this.getUIStateValue().getViewProps();
    }

    public triggerUIUpdate(): void {
        if (this.uiStateValue === undefined) {
            // ignore
        } else {
            return this.uiStateValue.triggerUIUpdate();
        }
    }

    public get triggerScheduled(): boolean {
        if (this.uiStateValue === undefined) {
            return false;
        } else {
            return this.uiStateValue.triggerScheduled;
        }
    }


    public set triggerScheduled(value: boolean) {
        if (this.uiStateValue === undefined) {
        } else {
            this.uiStateValue.triggerScheduled = value;
        }
    }
}