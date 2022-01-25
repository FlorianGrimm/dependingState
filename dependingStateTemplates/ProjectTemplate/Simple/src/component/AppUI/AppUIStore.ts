import {
    DSObjectStore,
} from "dependingState";

// import type { IAppStoreManager } from "~/store/AppStoreManager";

import { appUIStoreBuilder, loadData } from "./AppUIActions";
import { AppUIValue } from "./AppUIValue";


export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {

    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        appUIStoreBuilder.bindValueStore(this);
    }

    public initializeStore(): void {
        super.initializeStore();
        
        loadData.listenEvent("TODO", (e)=>{
        });        
    }

    public processDirty(): void {
        super.processDirty();
    }
}