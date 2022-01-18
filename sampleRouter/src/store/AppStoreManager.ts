import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppStore } from "./AppState";
import type { AppUIStore } from "~/component/AppUI/AppUIStore";
import type { PageAStore } from "src/component/PageA/PageAStore";
import type { RouterStore } from "~/component/Router/RouterStore";
import type { PageBStore } from "~/component/PageB/PageBStore";

export interface IAppStoreManager extends IDSStoreManager {
    routerStore: RouterStore;
    appStore: AppStore;
    appUIStore: AppUIStore;
    pageAStore: PageAStore;
    pageBStore: PageBStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public routerStore: RouterStore,
        public appStore: AppStore,
        public appUIStore: AppUIStore,
        public pageAStore: PageAStore,
        public pageBStore: PageBStore
    ) {
        super();
        this.attach(routerStore);
        this.attach(appStore);
        this.attach(appUIStore);
        this.attach(pageAStore);
        this.attach(pageBStore);

        this.postAttached();
    }
}