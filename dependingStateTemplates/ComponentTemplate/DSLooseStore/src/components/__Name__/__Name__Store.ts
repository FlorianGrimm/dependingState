import {
    DSObjectStore,
} from "dependingState";
import type { IAppStoreManager } from "~/services/AppStoreManager";
import { __Name__Value } from "./__Name__Value";


export class __Name__Store extends DSObjectStore<__Name__Value, "__Name__Store"> {
    appStateStateVersion: number;
    appViewProjectsUIStoreStateVersion: number;

    constructor(value: __Name__Value) {
        super("__Name__Store", value);
        this.appStateStateVersion = 0;
        this.appViewProjectsUIStoreStateVersion=0;
    }

    public initializeStore(): void {
        super.initializeStore();

        const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
        appState.listenDirtyRelated(this.storeName, this);

        this.stateValue.value.appState = appState.stateValue.value;
        this.isDirty = true;
    }

    public processDirty(): void {
        const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
        const appViewProjectsUIStore = (this.storeManager! as unknown as IAppStoreManager).appViewProjectsUIStore;
        let changed=false;
        if (this.appStateStateVersion !== appState.stateVersion) {
            this.appStateStateVersion = appState.stateVersion;
            this.stateValue.value.appState   = appState.stateValue.value;
            changed=true;
        }
     
        if (this.appViewProjectsUIStoreStateVersion !== appViewProjectsUIStore.stateVersion) {
            this.appViewProjectsUIStoreStateVersion = appViewProjectsUIStore.stateVersion;
            this.stateValue.value.appViewProjectsUIStateValue = appViewProjectsUIStore.stateValue.value;
            changed=true;
        }
        if (changed){
            this.stateValue.valueChanged();
        }
    }

    // public processDirty(): boolean {
    //     let result=super.processDirty();
    //     return  result;
    // }
}