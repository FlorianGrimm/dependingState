import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppStore } from "./AppState";
import type { AppUIStore } from "~/component/AppUI/AppUIStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    appUIStore:AppUIStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public appUIStore:AppUIStore,
    ) {
        super();
        this.attach(appStore);
        this.attach(appUIStore);
    }
}