import {
    IDSStateValue,
    DSUIProps,
    IDSValueStoreWithValue
} from "./types";
import { DSUIStateValue } from "./DSUIStateValue";
import { dsLog } from "./DSLog";
import { DSEventEntityVSValue } from ".";

export class DSStateValueSelf<Value extends DSStateValueSelf<Value>> implements IDSStateValue<Value>{
    store: IDSValueStoreWithValue<Value> | undefined;
    stateVersion: number;
    uiStateValue: DSUIStateValue<Value> | undefined;

    constructor() {
        this.store = undefined;
        this.stateVersion = 1;
        this.uiStateValue = undefined;
    }

    public get value(): Value {
        return this as unknown as Value;
    }

    public valueChanged(msg: string, properties?: Set<keyof Value> | undefined) {
        if (this.store !== undefined) {
            this.stateVersion = this.store.getNextStateVersion(this.stateVersion);
            this.store.emitValueChanged(msg ?? "valueChanged", this, properties);
            this.store.emitEvent<DSEventEntityVSValue<Value>>("value", { entity: this, properties: properties });
        }
        if (this.uiStateValue !== undefined) {
            if (this.store === undefined) {
                dsLog.debugACME("DS", "DSStateValueSelf", "valueChanged", "store is undefined");
                this.uiStateValue.triggerUIUpdate(this.stateVersion);
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
                this.uiStateValue.triggerUIUpdate(this.stateVersion);
            } else {
                this.store.emitUIUpdate(this.uiStateValue);
            }
        }
    }
    public triggerUIUpdate(stateVersion:number): void {
        if (this.uiStateValue === undefined) {
            // ignore
        } else {
            return this.uiStateValue.triggerUIUpdate(stateVersion);
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