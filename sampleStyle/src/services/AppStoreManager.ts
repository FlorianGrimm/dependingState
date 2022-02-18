import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppStore } from "./AppState";
import type { AppUIStore } from "~/components/AppUI/AppUIStore";
import type { CalculatorStore } from "src/components/Calculator/CalculatorStore";
import type { CalculatorStyleStore } from "~/components/CalculatorStyle/CalculatorStyleStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    appUIStore:AppUIStore;
    calculatorStore: CalculatorStore;
    calculatorStyleStore: CalculatorStyleStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public appUIStore:AppUIStore,
        public calculatorStore: CalculatorStore,
        public calculatorStyleStore: CalculatorStyleStore,
    ) {
        super();
        this.attach(appStore);
        this.attach(appUIStore);
        this.attach(calculatorStore);
        this.attach(calculatorStyleStore);
    }
}