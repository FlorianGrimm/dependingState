import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppStore } from "./AppState";
import type { AppViewStore } from "src/component/App/AppViewStore";
import type { PageAStore } from "src/component/PageA/PageAStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    appViewStore: AppViewStore;
    pageAUIStore: PageAStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public appViewStore: AppViewStore,
        public pageAUIStore: PageAStore,
    ) {
        super();
        this.attach(appStore);
        this.attach(appViewStore);
        this.attach(pageAUIStore);

        this.postAttached();
    }
}