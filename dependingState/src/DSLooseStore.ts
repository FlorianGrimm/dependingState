import { DSValueStore } from "./DSValueStore";
import { ConfigurationDSValueStore, IDSStateValue } from "./types";

export class DSLooseStore<
    Value,
    StoreName extends string
    > extends DSValueStore<undefined, Value, StoreName> {
        dirtyEntities:IDSStateValue<Value>[];
    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSValueStore<Value>
    ) {
        super(storeName, configuration);
        this.dirtyEntities=[]
    }
    
    public emitDirty(stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void {
        super.emitDirty(stateValue, properties);
        if (stateValue !== undefined){
            this.dirtyEntities.push(stateValue);
        }
    }

    public processDirty(): void {
        // super.processDirty();
        if (this.dirtyEntities.length>0){
            const dirtyEntities=this.dirtyEntities;
            this.dirtyEntities=[];
            for (const dirtyEntity of this.dirtyEntities) {
                this.processDirtyEntity(dirtyEntity);
            }
        }
    }

    processDirtyEntity(dirtyEntity: IDSStateValue<Value>) {
    }
}
