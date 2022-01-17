import {
    dsLog,
    DSObjectStore,
    DSStateValue,
    DSStateValueSelf,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { AppViewValue } from "./AppViewValue";


export class AppViewStore extends DSObjectStore<AppViewValue, AppViewValue, "appViewStore"> {
    appStateStateVersion: number;
    appViewProjectsUIStoreStateVersion: number;

    constructor(value: AppViewValue) {
        super("appViewStore", value);
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
        let changed=false;
        if (this.appStateStateVersion !== appState.stateVersion) {
            this.appStateStateVersion = appState.stateVersion;
            this.stateValue.appState = appState.stateValue;
            changed=true;
        }
    
        if (changed){
            this.stateValue.valueChanged();
        }
    }
}