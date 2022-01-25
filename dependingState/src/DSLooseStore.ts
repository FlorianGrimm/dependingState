import { DSValueStore } from "./DSValueStore";
import { ConfigurationDSLooseValueStore, ConfigurationDSValueStore, IDSStateValue } from "./types";

export class DSLooseStore<
    Value,
    StoreName extends string
    > extends DSValueStore<undefined, Value, StoreName> {
    // dirtyEntities: { stateValue: IDSStateValue<Value>, properties?: Set<keyof Value> }[];
    // isProcessDirtyEntityConfigured: boolean;

    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSLooseValueStore<Value>
    ) {
        super(storeName, configuration);
        // this.dirtyEntities = []
        // this.isProcessDirtyEntityConfigured = false;
    }

    // public initializeRegisteredEvents(): void {
    //     this.isProcessDirtyEntityConfigured = this.hasProcessDirtyEntityConfigured();
    //     this.isProcessDirtyConfigured = this.isProcessDirtyEntityConfigured || this.hasProcessDirtyConfigured();
    // }

    // public hasProcessDirtyConfigured(): boolean {
    //     if (this.configuration.processDirty !== undefined) { return true;}
    //     if (!(this.processDirty === DSLooseStore.prototype.processDirty)){ return true;}
    //     return false;
    // }

    // public hasProcessDirtyEntityConfigured(): boolean {
    //     if ((this.configuration as ConfigurationDSLooseValueStore<Value>).processDirtyEntity !== undefined) {return true;}
    //     if (!(this.processDirtyEntity === DSLooseStore.prototype.processDirtyEntity)){return true;}
    //     return false;
    // }

    // /**
    //  * should be called after a value change - or willbe called from DSPropertiesChanged.valueChangedIfNeeded().
    //  * calls all callbacks - registed with listenDirtyValue - which can call setDirty if a relevant property was changed.
    //  * @param msg the message is used for setDirty
    //  * @param stateValue the entity that changed
    //  * @param properties the properties that changed
    //  */
    // public emitValueChanged(msg: string, stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void {
    //     super.emitValueChanged(msg, stateValue, properties);
    //     if (stateValue !== undefined) {
    //         this.dirtyEntities.push({ stateValue, properties });
    //     }
    // }

    // public processDirty(): boolean {
    //     let result = super.processDirty();
    //     if (this.dirtyEntities.length > 0) {
    //         const dirtyEntities = this.dirtyEntities;
    //         this.dirtyEntities = [];
    //         const processDirtyEntity = (this.configuration as ConfigurationDSLooseValueStore<Value>).processDirtyEntity;
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
