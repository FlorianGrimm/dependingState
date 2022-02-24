// hint1 file found

import {
    DSObjectStore, getPropertiesChanged,
} from "dependingState";
import type { IAppStoreManager } from "~/services/AppStoreManager";
import { sumStoreBuilder } from "./SumActions";
import { SumValue } from "./SumValue";

export class SumStore extends DSObjectStore<SumValue, "SumStore"> {

    constructor(value: SumValue) {
        super("SumStore", value);
        sumStoreBuilder.bindValueStore(this);
    }

    public initializeStore(): void {
        super.initializeStore();

        const appUIStore = (this.storeManager! as IAppStoreManager).appUIStore;
        appUIStore.listenCleanedUpRelated("add", this);
        
        // enforce dirty for the first time
        this.setDirty("initializeStore");
    }
    
    public processDirty(): boolean {
        let result = super.processDirty();
        const appUIStore = (this.storeManager! as IAppStoreManager).appUIStore;
        const counterStore = (this.storeManager! as IAppStoreManager).counterStore;
        
        const sumPC = getPropertiesChanged(this.stateValue);
        sumPC.setIf("sumValue", appUIStore.stateValue.value.counter + counterStore.stateValue.value.nbrValue);
        if (sumPC.valueChangedIfNeeded("processDirty")){
            result = true;
        }
        return result;
    }
}