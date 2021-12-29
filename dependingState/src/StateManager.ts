import { StateValue } from "./StateValue";
import { StateValueBound } from "./StateValueBound";

//export enum x{};
export class StateManager {    
    stateVersion: number;
    nextStateVersion: number;
    constructor() {
        this.stateVersion = 1;
        this.nextStateVersion = 2;
    }
    getLiveState<TValue>(value: StateValue<TValue>) {
        return new StateValueBound<TValue>(this, value);
    }
}
/*
export class StateManager {
    stateVersion: number;
    nextStateVersion: number;
    constructor() {
        this.stateVersion = 1;
        this.nextStateVersion = 1;
    }
    
    valueState<T>(value: T, owner?: ValueState): ValueState<T> {
        const result: ValueState<T> = new ValueState<T>(this, value, owner);
        return result;
    }

    setValueStateVersion(valueState: ValueState) {
        valueState.stateVersion = this.nextStateVersion;
        valueState.valueDirty = true;
    }
}

export class ValueState<T = any> {
    stateManager: StateManager;
    stateVersion: number;
    _value: T;
    owner: ValueState | undefined;
    valueDirty: boolean;
    itemsDirty: boolean;
    constructor(stateManager: StateManager, value: T, owner: ValueState | undefined = undefined, initialDirty: boolean | undefined = true) {
        this.stateManager = stateManager;
        this.stateVersion = 0;
        this._value = value;
        this.owner = owner;
        this.valueDirty = (initialDirty === undefined) ? true : initialDirty;
        this.itemsDirty = (owner === undefined) ? false : ((initialDirty === undefined) ? true : initialDirty);
    }

    get value(): T {
        return this._value;
    }
    set value(value: T) {
        this._value = value;
        this.stateManager.setValueStateVersion(this);
        
    }
}
*/