import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppStore } from "./AppState";
import type { AppViewStore } from "src/component/App/AppViewStore";
import type { CalculatorStore } from "src/component/Calculator/CalculatorStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    appViewStore: AppViewStore;
    calculatorStore: CalculatorStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public appViewStore: AppViewStore,
        public calculatorStore: CalculatorStore,
    ) {
        super();
        this.attach(appStore);
        this.attach(appViewStore);
        this.attach(calculatorStore);

        this.postAttached();
    }
}