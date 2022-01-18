import {
    DSObjectStore,
    getPropertiesChanged
} from "dependingState";
import { appLog } from "~/feature/appLog/appLog";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { AppUIValue } from "./AppUIValue";


export class AppUIStore extends DSObjectStore<AppUIValue, AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
    }

    public postAttached(): void {
        super.postAttached();
        this.isDirty = true;
        this.enableEmitDirtyFromValueChanged=true;

        const appStore = (this.storeManager! as IAppStoreManager).appStore;
        const routerStore = (this.storeManager! as IAppStoreManager).routerStore;
        appStore.listenDirtyRelated(this.storeName, this);

        routerStore.listenEmitDirty("AppUIStore listen to router", (stateValue, properties) => {
            if (this.isDirty) { return; }
            if ((properties == undefined) || properties.has("page") || properties.has("to")) {
                this.isDirty = true;
            }
        });

        this.stateValue.appState = appStore.stateValue;
    }

    public processDirty(): void {
        appLog.debugACME("app", "AppUIStore", "processDirty", "%");
        const appStore = (this.storeManager! as IAppStoreManager).appStore;
        const routerStore = (this.storeManager! as IAppStoreManager).routerStore;

        const stateValuePC = getPropertiesChanged(this.stateValue);

        if (stateValuePC.setIf("appStateStateVersion", appStore.stateValue.stateVersion)) {
            stateValuePC.setIf("appState", appStore.stateValue.value);
        }

        if (stateValuePC.setIf("routerValueStateVersion", appStore.stateValue.stateVersion)) {
            stateValuePC.setIf("routerValue", routerStore.stateValue.value);
        }

        stateValuePC.valueChangedIfNeeded();
    }
}