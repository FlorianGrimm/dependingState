import type {
    ConfigurationDSMapValueStore
} from "dependingState";

import {
    DSMapStore
} from "dependingState";

import type { IAppStoreManager } from "~/services/AppStoreManager";

import { __Name__Value } from "./__Name__Value";
import { __name__StoreBuilder } from "./__Name__Actions";

export class __Name__Store extends DSMapStore<string, __Name__Value, "__Name__Store"> {
    constructor(
        configuration?: ConfigurationDSMapValueStore<__Name__Value>
    ) {
        super("__Name__Store", configuration);
    }

    public initializeStore(): void {
        super.initializeStore();

        this.bindEventAll(__name__StoreBuilder);

        // const appState = (this.storeManager! as unknown as IAppStoreManager).appUIStore;
        // appUIStore.listenCleanedUpRelated(this.storeName, this);

        // this.stateValue.value.appState = appState.stateValue.value;
        // this.isDirty = true;
    }

    // public processDirty(): boolean {
    //     let result=super.processDirty();
    //     const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
    //     const appViewProjectsUIStore = (this.storeManager! as unknown as IAppStoreManager).appViewProjectsUIStore;
    //     let changed=false;
    //     if (this.appStateStateVersion !== appState.stateVersion) {
    //         this.appStateStateVersion = appState.stateVersion;
    //         this.stateValue.value.appState   = appState.stateValue.value;
    //         changed=true;
    //     }
     
    //     if (this.appViewProjectsUIStoreStateVersion !== appViewProjectsUIStore.stateVersion) {
    //         this.appViewProjectsUIStoreStateVersion = appViewProjectsUIStore.stateVersion;
    //         this.stateValue.value.appViewProjectsUIStateValue = appViewProjectsUIStore.stateValue.value;
    //         changed=true;
    //     }
    //     if (changed){
    //         this.stateValue.valueChanged();
    //     }
    //     return  result;
    // }

    // public processDirty(): boolean {
    //     let result=super.processDirty();
    //     return  result;
    // }
}