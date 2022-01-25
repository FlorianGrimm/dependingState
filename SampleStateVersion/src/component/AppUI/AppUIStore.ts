import {
    DSObjectStore, hasChangedProperty,
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

        this.listenEventValue("value has changed", (e)=>{
            if (hasChangedProperty(e.payload.properties, "name")){
                this.isDirty=true;
                this.emitDirty
            }            
        });
    }

    public processDirty(): void {
        super.processDirty();
        const value=this.stateValue.value;
        value.greeting = `Hello ${value.name}`;
        // TODO
        console.log(value.greeting);
        this.emitUIUpdate(this.stateValue);
    }
}