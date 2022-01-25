import {
    ConfigurationDSMapValueStore,
    IDSMapStore,
    IDSStateValue,
    DSEventEntityVSAttach,
    DSEventEntitySVDetach,
    DSEventEntityVSValue,
    DSEventHandler,
    DSUnlisten,
} from "./types";

import { DSValueStore } from "./DSValueStore";
import { DSStateValue } from "./DSStateValue";

export class DSMapStore<
    Key,
    Value,
    StoreName extends string = string
    > extends DSValueStore<Key, Value, StoreName> implements IDSMapStore<Key, Value, StoreName> {
    entities: Map<Key, IDSStateValue<Value>>;
    // dirtyEntities: { stateValue: IDSStateValue<Value>, properties?: Set<keyof Value> }[];
    // isProcessDirtyEntityConfigured: boolean;

    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSMapValueStore<Value>
    ) {
        super(storeName, configuration);
        this.entities = new Map();
        // this.dirtyEntities = [];
        // this.isProcessDirtyEntityConfigured = false;
    }

    public create(key: Key, value: Value): IDSStateValue<Value> {
        const create = (this.configuration as ConfigurationDSMapValueStore<Value>).create;
        if (create !== undefined) {
            const result = create(value);
            this.attach(key, result);
            return result;
        } else {
            const result = new DSStateValue<Value>(value);
            this.attach(key, result);
            return result;
        }
    }

    public get(key: Key): (IDSStateValue<Value> | undefined) {
        return this.entities.get(key);
    }

    public getEntities(): { key: Key; stateValue: IDSStateValue<Value>; }[] {
        return Array.from(this.entities.entries()).map((e) => ({ key: e[0], stateValue: e[1] }));
    }

    // public initializeRegisteredEvents(): void {
    //     this.isProcessDirtyEntityConfigured = this.hasProcessDirtyEntityConfigured();
    //     this.isProcessDirtyConfigured = this.isProcessDirtyEntityConfigured || this.hasProcessDirtyConfigured();
    // }

    // public hasProcessDirty(): boolean {
    //     if (this.configuration.processDirty !== undefined) { return true; }
    //     if (!(this.processDirty === DSMapStore.prototype.processDirty)) { return true; }
    //     return false;
    // }

    // public hasProcessDirtyEntityConfigured(): boolean {
    //     if ((this.configuration as ConfigurationDSMapValueStore<Value>).processDirtyEntity !== undefined) { return true; }
    //     if (!(this.processDirtyEntity === DSMapStore.prototype.processDirtyEntity)) { return true; }
    //     return false;
    // }


    public attach(key: Key, stateValue: IDSStateValue<Value>): (IDSStateValue<Value> | undefined) {
        if (stateValue.setStore(this)) {
            const oldValue = this.entities.get(key);
            if (oldValue === undefined) {
                this.entities.set(key, stateValue);
                this.emitEvent<DSEventEntityVSAttach<Value, Key, never, StoreName>>("attach", { entity: stateValue, key: key });
            } else if (oldValue === stateValue) {
                // do nothing
            } else {
                oldValue.store = undefined;
                this.emitEvent<DSEventEntitySVDetach<Value, Key, never, StoreName>>("detach", { entity: oldValue, key: key });
                this.entities.set(key, stateValue);
                this.emitEvent<DSEventEntityVSAttach<Value, Key, never, StoreName>>("attach", { entity: stateValue, key: key });
            }
            return oldValue;
        } else {
            return stateValue;
        }
    }

    public detach(key: Key): void {
        const oldValue = this.entities.get(key);
        if (oldValue === undefined) {
            // do nothing
        } else {
            oldValue.store = undefined;
            this.emitEvent<DSEventEntitySVDetach<Value, Key, never, StoreName>>("detach", { entity: oldValue, key: key });
        }
    }

    // public emitValueChanged(msg: string, stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void {
    //     super.emitValueChanged(msg, stateValue, properties);
    //     if (stateValue !== undefined) {
    //         this.dirtyEntities.push({ stateValue, properties });
    //     }
    // }

    public listenEventAttach<Event extends DSEventEntityVSAttach<Value, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "attach", callback as any);
    }

    public listenEventValue<Event extends DSEventEntityVSValue<Value, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventEntitySVDetach<IDSStateValue<Value>, Key, never, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], string>): DSUnlisten {
        return this.listenEvent(msg, "detach", callback as any);
    }

    // public processDirty(): boolean {
    //     let result = super.processDirty();
    //     if (this.dirtyEntities.length > 0) {
    //         const dirtyEntities = this.dirtyEntities;
    //         this.dirtyEntities = [];
    //         const processDirtyEntity = (this.configuration as ConfigurationDSMapValueStore<Value>).processDirtyEntity;
    //         if (processDirtyEntity === undefined) {
    //             for (const { stateValue, properties } of dirtyEntities) {
    //                 this.processDirtyEntity(stateValue, properties);
    //             }
    //         } else {
    //             for (const { stateValue, properties } of dirtyEntities) {
    //                 processDirtyEntity(stateValue, properties);
    //                 this.processDirtyEntity(stateValue, properties);
    //             }

    //         }
    //     }
    //     return result;
    // }

    // processDirtyEntity(dirtyEntity?: IDSStateValue<Value>, properties?: Set<keyof Value>): boolean {
    //     return false;
    // }
}
