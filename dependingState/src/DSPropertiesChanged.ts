import { dsLog } from ".";
import {
    IDSPropertiesChanged,
    IDSStateValue
} from "./types";

const cache: IDSPropertiesChanged<any>[] = [];

export function getPropertiesSet<Value>(keys:(keyof Value)[]):Set<keyof Value>{
    return new Set<keyof Value>(keys);
}

export function getPropertiesChanged<
        Value
    >(that: IDSStateValue<Value>): IDSPropertiesChanged<Value> {
    const result = cache.pop() as (DSPropertiesChanged<Value> | undefined);
    if (result === undefined) {
        return new DSPropertiesChanged<Value>(that);
    } else {
        result.instance = that;
        return result;
    }
}

export class DSPropertiesChanged<
        Value
    > implements IDSPropertiesChanged<Value> {
    properties: Set<keyof Value>;

    constructor(
        public instance: IDSStateValue<Value>
    ) {
        this.properties = new Set();
    }

    public add(key: keyof Value) {
        this.properties.add(key);
    }

    public setIf<K extends keyof Value>(key: K, value: Value[K], fnIsEqual?: (o: Value[K], n: Value[K]) => boolean): boolean {
        const isEqual = ((fnIsEqual === undefined)
            ? (this.instance.value[key] === value)
            : (fnIsEqual(this.instance.value[key], value)));
        if (isEqual) {
            // skip
            return false;
        } else {
            this.instance.value[key] = value;
            this.add(key);
            return true;
        }
    }

    public get hasChanged(): boolean {
        return this.properties.size > 0;
    }

    public giveBack(): void {
        this.instance = null! as any;
        this.properties.clear();
        cache.push(this as any);
    }

    public valueChangedIfNeeded(msg:string): boolean {
        if (this.properties.size === 0) {
            this.instance = null! as any;
            cache.push(this as any);
            return false;
        } else {
            const instance = this.instance;
            this.instance = null! as any;
            if (dsLog.isEnabled("valueChangedIfNeeded")){
                dsLog.infoACME("DS", "DSPropertiesChanged", "valueChangedIfNeeded", msg);
            }
            instance.valueChanged(msg, this.properties);
            return true;
        }
    }

    public toString(): string {
        return Array.from(this.properties.keys()).join(", ");
    }
}

export function hasChangedProperty<Value>(    properties: Set<keyof Value>|undefined, property1:keyof Value, property2?:keyof Value, property3?:keyof Value, property4?:keyof Value){
    return ((properties===undefined) 
        || ((property1===undefined) || (properties.has(property1)))
        || ((property2===undefined) || (properties.has(property2)))
        || ((property3===undefined) || (properties.has(property3)))
        || ((property4===undefined) || (properties.has(property4)))
        ); 
}
//