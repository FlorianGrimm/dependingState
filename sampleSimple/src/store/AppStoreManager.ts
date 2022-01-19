import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppStore } from "./AppState";
import type { AppUIStore } from "~/component/AppUI/AppUIStore";
import type { CalculatorStore } from "src/component/Calculator/CalculatorStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    appUIStore:AppUIStore;
    calculatorStore: CalculatorStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public appUIStore:AppUIStore,
        public calculatorStore: CalculatorStore,
    ) {
        super();
        this.attach(appStore);
        this.attach(appUIStore);
        this.attach(calculatorStore);
    }
}