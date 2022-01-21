import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppUIStore } from "~/component/AppUI/AppUIStore";
import type { CounterStore } from "~/component/Counter/CounterStore";
import type { SumStore } from "~/component/Sum/SumStore";

export interface IAppStoreManager extends IDSStoreManager {
    appUIStore: AppUIStore;
    counterStore: CounterStore;
    sumStore: SumStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appUIStore: AppUIStore,
        public counterStore: CounterStore,
        public sumStore: SumStore,
    ) {
        super();
        this.attach(appUIStore);
        this.attach(counterStore);
        this.attach(sumStore);
    }
}