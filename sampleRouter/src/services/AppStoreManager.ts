import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { DSRouterStore, DSRouterValue } from "dependingStateRouter";
import type { AppUIStore } from "~/components/AppUI/AppUIStore";
import type { PageAStore } from "src/components/PageA/PageAStore";
import type { PageBStore } from "~/components/PageB/PageBStore";
import { NavigatorStore } from "~/components/Navigator/NavigatorStore";

export interface IAppStoreManager extends IDSStoreManager {
    routerStore: DSRouterStore<DSRouterValue>;
    navigatorStore: NavigatorStore;
    appUIStore: AppUIStore;
    pageAStore: PageAStore;
    pageBStore: PageBStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public routerStore: DSRouterStore<DSRouterValue>,
        public navigatorStore: NavigatorStore,
        public appUIStore: AppUIStore,
        public pageAStore: PageAStore,
        public pageBStore: PageBStore
    ) {
        super();
        this.attach(routerStore);
        this.attach(navigatorStore);
        this.attach(appUIStore);
        this.attach(pageAStore);
        this.attach(pageBStore);
    }
}