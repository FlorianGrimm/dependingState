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

    public postAttached(): void {
        super.postAttached();
        
        loadData.listenEvent("TODO", (e)=>{
        });        
    }

    public processDirty(): void {
        super.processDirty();
    }
}