import { deepEquals } from "./deepEquals";
import { TStateVersion } from "./types";

export function testAndSet<T>(newValue: T, oldValue: T, setter: (newValue: T) => void, hasChanged:boolean): boolean {
    if (deepEquals(oldValue, newValue, true)) {
        return hasChanged;
    } else {
        setter(newValue);
        return true;
    }
}

export function testAndSetProp<TInstance extends any, TKey extends keyof TInstance>(instance: TInstance, key: TKey, newValue: TInstance[TKey], hasChanged:boolean): boolean {
    const oldValue = instance[key];
    if (deepEquals(oldValue, newValue, true)) {
        return hasChanged;
    } else {
        instance[key] = newValue;
        return true;
    }
}

export function initStateVersion<T>(state:Exclude<T, TStateVersion>):T{
    (state as unknown as TStateVersion).stateVersion  = 1;
    return state as unknown as T;
}