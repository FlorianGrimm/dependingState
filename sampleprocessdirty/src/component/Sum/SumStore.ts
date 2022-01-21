// hint1 file found

import {
    DSObjectStore, getPropertiesChanged,
} from "dependingState";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { sumStoreBuilder } from "./SumActions";
import { SumValue } from "./SumValue";

export class SumStore extends DSObjectStore<SumValue, "SumStore"> {

    constructor(value: SumValue) {
        super("SumStore", value);
        sumStoreBuilder.bindValueStore(this);
    }

    public postAttached(): void {
        super.postAttached();

        const appUIStore = (this.storeManager! as IAppStoreManager).appUIStore;
        appUIStore.listenDirtyRelated(this.storeName, this);
        
        // enforce dirty for the first time
        this.isDirty = true;
    }
    
    public processDirty(): void {
        super.processDirty();
        const appUIStore = (this.storeManager! as IAppStoreManager).appUIStore;
        const counterStore = (this.storeManager! as IAppStoreManager).counterStore;
        
        const sumPC = getPropertiesChanged(this.stateValue);
        sumPC.setIf("sumValue", appUIStore.stateValue.value.counter + counterStore.stateValue.value.nbrValue);
        sumPC.valueChangedIfNeeded();
    }
}