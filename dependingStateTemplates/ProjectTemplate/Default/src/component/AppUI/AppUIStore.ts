import {
    DSObjectStore,
    getPropertiesChanged,
    hasChangedProperty
} from "dependingState";
import { appLog } from "~/feature/appLog/appLog";
import { getAppStoreManager } from "~/singletonAppStoreManager";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { AppUIValue } from "./AppUIValue";

export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
    }

    public postAttached(): void {
        super.postAttached();

        const navigatorStore = getAppStoreManager().navigatorStore;
        navigatorStore.listenEmitDirty("AppUIStore listen to router", (stateValue, properties) => {
            if (hasChangedProperty(properties, "page")) {
                this.stateValue.emitUIUpdate();
            }
            this.isDirty=true;
        });
    }

    public processDirty(): void {
        // do something
    }
}