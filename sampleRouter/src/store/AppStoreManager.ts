import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { DSRouterStore, DSRouterValue } from "dependingStateRouter";
import type { AppStore } from "./AppState";
import type { AppUIStore } from "~/component/AppUI/AppUIStore";
import type { PageAStore } from "src/component/PageA/PageAStore";
import type { PageBStore } from "~/component/PageB/PageBStore";
import { NavigatorStore } from "~/component/Navigator/NavigatorStore";

export interface IAppStoreManager extends IDSStoreManager {
    routerStore: DSRouterStore<DSRouterValue>;
    navigatorStore: NavigatorStore;
    appStore: AppStore;
    appUIStore: AppUIStore;
    pageAStore: PageAStore;
    pageBStore: PageBStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public routerStore: DSRouterStore<DSRouterValue>,
        public navigatorStore: NavigatorStore,
        public appStore: AppStore,
        public appUIStore: AppUIStore,
        public pageAStore: PageAStore,
        public pageBStore: PageBStore
    ) {
        super();
        this.attach(routerStore);
        this.attach(navigatorStore);
        this.attach(appStore);
        this.attach(appUIStore);
        this.attach(pageAStore);
        this.attach(pageBStore);
    }
}