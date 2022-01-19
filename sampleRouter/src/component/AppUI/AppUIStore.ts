import {
    DSObjectStore,
    getPropertiesChanged
} from "dependingState";
import { appLog } from "~/feature/appLog/appLog";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { AppUIValue } from "./AppUIValue";

export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
    }

    public postAttached(): void {
        super.postAttached();
        this.isDirty = true;
        this.enableEmitDirtyFromValueChanged = true;

        const appStore = (this.storeManager! as IAppStoreManager).appStore;
        const navigatorStore = (this.storeManager! as IAppStoreManager).navigatorStore;
        appStore.listenDirtyRelated(this.storeName, this);

        navigatorStore.listenEmitDirty("AppUIStore listen to router", (stateValue, properties) => {
            if (this.isDirty) { return; }
            if ((properties == undefined) || properties.has("page")) {
                this.isDirty = true;
            }
        });

        this.stateValue.value.appState = appStore.stateValue;
        this.stateValue.value.navigatorValue = navigatorStore.stateValue
    }

    public processDirty(): void {
        appLog.debugACME("app", "AppUIStore", "processDirty", "%");
        const appStore = (this.storeManager! as IAppStoreManager).appStore;
        const navigatorStore = (this.storeManager! as IAppStoreManager).navigatorStore;

        const stateValuePC = getPropertiesChanged(this.stateValue);

        if (stateValuePC.setIf("appStateStateVersion", appStore.stateValue.stateVersion)) {
            stateValuePC.setIf("appState", appStore.stateValue.value);
        }

        if (stateValuePC.setIf("navigatorValueStateVersion", appStore.stateValue.stateVersion)) {
            stateValuePC.setIf("navigatorValue", navigatorStore.stateValue);
        }

        stateValuePC.valueChangedIfNeeded();
    }
}