import {
    ConfigurationDSArrayValueStore,
    DSEventEntityVSAttach,
    DSEventEntitySVDetach,
    DSEventHandler,
    DSEventEntityVSValue,
    IDSArrayStore,
    IDSStateValue,
    DSUnlisten
} from "./types";

import { DSValueStore } from "./DSValueStore";
import { DSStateValue } from "./DSStateValue";

export class DSArrayStore<
    Value = any,
    StoreName extends string = string
    > extends DSValueStore<number, Value, StoreName> implements IDSArrayStore<number, Value, StoreName>    {
    entities: IDSStateValue<Value>[];
    // dirtyEntities: { stateValue: IDSStateValue<Value>, properties?: Set<keyof Value> }[];
    // isProcessDirtyEntityConfigured: boolean;

    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSArrayValueStore<Value>
    ) {
        super(storeName, configuration);
        this.entities = [];
        // this.dirtyEntities = []
        // this.isProcessDirtyEntityConfigured = false;
    }

    public getEntities(): { key: number; stateValue: IDSStateValue<Value>; }[] {
        return this.entities.map((e, index) => ({ key: index, stateValue: e }));
    }

    public create(value: Value): IDSStateValue<Value> {
        const create = (this.configuration as ConfigurationDSArrayValueStore<Value>).create;
        if (create !== undefined) {
            const result = create(value);
            this.attach(result);
            return result;
        } else {
            const result = new DSStateValue<Value>(value);
            this.attach(result);
            return result;
        }
    }

    // public initializeRegisteredEvents(): void {
    //     this.isProcessDirtyEntityConfigured = this.hasProcessDirtyEntityConfigured();
    //     this.isProcessDirtyConfigured = this.isProcessDirtyEntityConfigured || this.hasProcessDirtyConfigured();
    // }

    // public hasProcessDirty(): boolean {
    //     if (this.configuration.processDirty !== undefined) { return true; }
    //     if (!(this.processDirty === DSArrayStore.prototype.processDirty)) { return true; }
    //     return false;
    // }

    // public hasProcessDirtyEntityConfigured(): boolean {
    //     if ((this.configuration as ConfigurationDSArrayValueStore<Value>).processDirtyEntity !== undefined) { return true; }
    //     if (!(this.processDirtyEntity === DSArrayStore.prototype.processDirtyEntity)) { return true; }
    //     return false;
    // }

    public attach(stateValue: IDSStateValue<Value>): void {
        if (stateValue.setStore(this)) {
            this.entities.push(stateValue);
            const index = this.entities.length - 1;
            this.emitEvent<DSEventEntityVSAttach<Value, never, number, StoreName>>("attach", { entity: stateValue, index: index });
        }
    }

    public detach(stateValue: IDSStateValue<Value>): void {
        const index = this.entities.findIndex((item) => item === stateValue);
        if (index < 0) {
            // do nothing
        } else {
            const oldValue = this.entities.splice(index, 1)[0];
            oldValue.store = undefined;
            this.emitEvent<DSEventEntitySVDetach<Value, never, number, StoreName>>("detach", { entity: oldValue, index: index });
        }
    }

    public listenEventAttach<Event extends DSEventEntityVSAttach<Value, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "attach", callback as any);
    }

    public listenEventValue<Event extends DSEventEntityVSValue<Value, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "value", callback as any);
    }

    public listenEventDetach<Event extends DSEventEntitySVDetach<Value, never, number, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        return this.listenEvent(msg, "detach", callback as any);
    }

    // public processDirty(): boolean {
    //     let result = super.processDirty();
    //     if (this.dirtyEntities.length > 0) {
    //         const dirtyEntities = this.dirtyEntities;
    //         this.dirtyEntities = [];
    //         const processDirtyEntity = (this.configuration as ConfigurationDSArrayValueStore<Value>).processDirtyEntity;
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