import {
    IDSPropertiesChanged,
    IDSStateValue
} from "./types";

const cache: IDSPropertiesChanged<any, any>[] = [];

export function getPropertiesChanged<
    StateValue extends IDSStateValue<Value>,
    Value
>(that: StateValue): IDSPropertiesChanged<StateValue, Value> {
    const result = cache.pop() as (IDSPropertiesChanged<StateValue, StateValue['value']> | undefined);
    if (result === undefined) {
        return new DSPropertiesChanged<StateValue,Value>(that);
    } else {
        (result as DSPropertiesChanged<StateValue, Value>).instance = that;
        return result;
    }
}

export class DSPropertiesChanged<
    StateValue extends IDSStateValue<Value>,
    Value
    > implements IDSPropertiesChanged<StateValue, Value> {
    properties: Set<keyof StateValue['value']>;

    constructor(
        public instance: StateValue
    ) {
        this.properties = new Set();
    }

    public add(key: keyof StateValue['value']) {
        this.properties.add(key);
    }

    public setIf<K extends keyof StateValue['value']>(key: K, value: StateValue['value'][K], fnIsEqual?: (o: StateValue['value'][K], n: StateValue['value'][K]) => boolean): boolean {
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

    public valueChangedIfNeeded(): boolean {
        if (this.properties.size === 0) {
            this.instance = null! as any;
            cache.push(this as any);
            return false;
        } else {
            const instance = this.instance;
            this.instance = null! as any;
            instance.valueChanged(this.properties);
            return true;
        }
    }

    public toString(): string {
        return Array.from(this.properties.keys()).join(", ");
    }
}