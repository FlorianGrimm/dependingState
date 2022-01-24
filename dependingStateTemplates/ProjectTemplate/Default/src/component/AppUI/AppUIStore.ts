import {
    DSObjectStore,
} from "dependingState";

// import type { IAppStoreManager } from "~/store/AppStoreManager";
import { appUIStoreBuilder, loadData } from "./AppUIActions";
import { AppUIValue } from "./AppUIValue";
import { getAppStoreManager } from "~/singletonAppStoreManager";


export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {

    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        appUIStoreBuilder.bindValueStore(this);
    }

    public initializeStore(): void {
        super.initializeStore();
        
        loadData.listenEvent("TODO", (e)=>{
        });        
    
        const navigatorStore = getAppStoreManager().navigatorStore;
        navigatorStore.listenemitDirtyValue("AppUIStore listen to router", (stateValue, properties) => {
            if (hasChangedProperty(properties, "page")) {
                this.stateValue.emitUIUpdate();
            }
        });
        // this.isDirty=true;
    }    

    // public processDirty(): void {
    //     super.processDirty();
    // }
}