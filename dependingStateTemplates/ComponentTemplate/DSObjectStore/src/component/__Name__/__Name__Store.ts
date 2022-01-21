import {
    DSObjectStore,
} from "dependingState";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { __name__StoreBuilder, countDown, countUp } from "./__Name__Actions";
import { __Name__Value } from "./__Name__Value";


export class __Name__Store extends DSObjectStore<__Name__Value, "__Name__Store"> {

    constructor(value: __Name__Value) {
        super("__Name__Store", value);
        __name__StoreBuilder.bindValueStore(this);
    }

    public postAttached(): void {
        super.postAttached();
        
        //const xxxStore = (this.storeManager! as IAppStoreManager).xxxStore;
        //xxxStore.listenDirtyRelated(this.storeName, this);      

        countDown.listenEvent("TODO", (e)=>{
        });

        countUp.listenEvent("TODO", (e)=>{
        });
    }

    public processDirty(): void {
        super.processDirty();
    }
}