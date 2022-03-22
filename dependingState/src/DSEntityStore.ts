import {
  ConfigurationDSEntityValueStore,
  IDSStateValue
} from "./types";

import { DSMapStore } from "./DSMapStore";
import { DSStateValue } from "./DSStateValue";

export class DSEntityStore<
  Key,
  Value,
  StoreName extends string = string
  > extends DSMapStore<Key, Value, StoreName>{
  constructor(
    storeName: StoreName,
    configuration?: ConfigurationDSEntityValueStore<Key, Value>
  ) {
    super(storeName, configuration);
    if (typeof configuration?.getKey !== "function"){
      throw new Error(`${storeName} getKey must be a function`);
    }
  }

  private _setInner(
    value: Value,
    //getKey: (value: Value) => Key,
    key: Key,
    create?: ((value: Value) => IDSStateValue<Value>) | undefined
  ): IDSStateValue<Value> {
    if (create !== undefined) {
      const result = create(value);
      //const key = getKey(value);
      this.attach(key, result);
      return result;
    } else {
      const result = new DSStateValue<Value>(value);
      //const key = getKey(value);
      this.attach(key, result);
      return result;
    }
  }

  public set(value: Value): IDSStateValue<Value> {
    const getKey = (this.configuration as ConfigurationDSEntityValueStore<Key, Value>).getKey!;
    const key = getKey(value);
    const create = (this.configuration as ConfigurationDSEntityValueStore<Key, Value>).create;
    return this._setInner(value, key, create)
  }

  public setMany(values: Value[], clear: boolean) {
    const getKey = (this.configuration as ConfigurationDSEntityValueStore<Key, Value>).getKey!;
    const create = (this.configuration as ConfigurationDSEntityValueStore<Key, Value>).create;
    if (clear){
      const map = new Map(this.entities.entries());
      for (const value of values) {
        const key = getKey(value);
        map.delete(key);
        this._setInner(value, key, create);
      }
      for (const key of map.keys()){
        this.detach(key);
      }
    } else {
      for (const value of values) {
        const key = getKey(value);
        this._setInner(value, key, create);
      }
    }
  }
}

