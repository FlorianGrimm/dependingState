import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppUIStore } from "~/component/AppUI/AppUIStore";

export interface IAppStoreManager extends IDSStoreManager {
    appUIStore:AppUIStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appUIStore:AppUIStore,
    ) {
        super();
        this.attach(appUIStore);
    }
}