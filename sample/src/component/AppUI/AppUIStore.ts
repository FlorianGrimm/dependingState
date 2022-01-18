import {
    DSObjectStore,
} from "dependingState";
import type { IAppStoreManager } from "../../store/AppStoreManager";
import { AppUIValue } from "./AppUIValue";


export class AppUIStore extends DSObjectStore<AppUIValue, AppUIValue, "AppUIStore"> {
    appStateStateVersion: number;
    appViewProjectsUIStoreStateVersion: number;

    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        this.appStateStateVersion = 0;
        this.appViewProjectsUIStoreStateVersion=0;
    }

    public postAttached(): void {
        super.postAttached();

        const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
        appState.listenDirtyRelated(this.storeName, this);

        this.stateValue.appState = appState.stateValue;
        this.isDirty = true;
    }

    public processDirty(): void {
        const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
        const appViewProjectsUIStore = (this.storeManager! as unknown as IAppStoreManager).appViewProjectsUIStore;
        let changed=false;
        if (this.appStateStateVersion !== appState.stateVersion) {
            this.appStateStateVersion = appState.stateVersion;
            this.stateValue.appState = appState.stateValue;
            changed=true;
        }
     
        if (this.appViewProjectsUIStoreStateVersion !== appViewProjectsUIStore.stateVersion) {
            this.appViewProjectsUIStoreStateVersion = appViewProjectsUIStore.stateVersion;
            this.stateValue.appViewProjectsUIStateValue = appViewProjectsUIStore.stateValue;
            changed=true;
        }
        if (changed){
            this.stateValue.valueChanged();
        }
    }
}