import {
    IDSStateValue,
    DSUIProps,
    IDSPropertiesChanged as IDSPropertiesChanged,
    IDSValueStoreWithValue
} from "./types";
import { DSUIStateValue } from "./DSUIStateValue";
import { dsLog } from "./DSLog";
import { DSEventEntityVSValue } from ".";

export class DSStateValue<Value> implements IDSStateValue<Value>{
    private _value: Value;
    private _stateVersion: number;

    isDirty: boolean;
    store: IDSValueStoreWithValue<Value> | undefined;
    uiStateValue: DSUIStateValue<Value> | undefined;

    constructor(value: Value) {
        this._value = value;
        this.isDirty = false;
        this.store = undefined;
        this._stateVersion = 1;
        this.uiStateValue = undefined;
    }

    public get stateVersion(): number {
        return this._stateVersion;
    }

    public set stateVersion(value: number) {
        this._stateVersion = value;
        dsLog.infoACME("DS", "DSStateValue", "stateVersion", this._value);
    }

    public get value(): Value {
        return this._value;
    }

    public set value(v: Value) {
        this._value = v;
        this.valueChanged(undefined);
    }

    public valueChanged(properties?: Set<keyof Value> | undefined) {
        this.isDirty = false;
        if (this.store !== undefined) {
            this.stateVersion = this.store.getNextStateVersion(this.stateVersion);
            this.store.emitDirtyFromValueChanged(this, properties);
            this.store.emitEvent<DSEventEntityVSValue<Value>>("value", { entity: this, properties: properties });
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

    public setStore(store: IDSValueStoreWithValue<Value>): boolean {
        if (this.store === undefined) {
            this.store = store;
            this.stateVersion = store.getNextStateVersion(this.stateVersion);
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

    public emitUIUpdate(): void {
        if (this.uiStateValue !== undefined) {
            if (this.store === undefined) {
                this.uiStateValue.triggerUIUpdate();
            } else {
                this.store.emitUIUpdate(this.uiStateValue);
            }
        }
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
    store: IDSValueStoreWithValue<Value> | undefined;
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

    public valueChanged(properties?: Set<keyof Value> | undefined) {
        this.isDirty = false;
        if (this.store !== undefined) {
            this.stateVersion = this.store.getNextStateVersion(this.stateVersion);
            this.store.emitDirtyFromValueChanged(this, properties);
            //this.store.emitEvent<DSEventValue<DSStateValueSelf<Value>, string, Value>>("value", { entity: this, properties: properties });
            this.store.emitEvent<DSEventEntityVSValue<Value>>("value", { entity: this, properties: properties });
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

    public setStore(store: IDSValueStoreWithValue<Value>): boolean {
        if (this.store === undefined) {
            this.store = store;
            this.stateVersion = store.getNextStateVersion(this.stateVersion);
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

    public emitUIUpdate(): void {
        if (this.uiStateValue !== undefined) {
            if (this.store === undefined) {
                this.uiStateValue.triggerUIUpdate();
            } else {
                this.store.emitUIUpdate(this.uiStateValue);
            }
        }
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