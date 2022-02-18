import { DSObjectStore, DSStateValueSelf } from "dependingState";
import type { CalculatorValue } from "~/components/Calculator/CalculatorValue";
import { IAppStoreManager } from "./AppStoreManager";

export class AppState extends DSStateValueSelf<AppState> {
    public calculator: CalculatorValue | undefined;

    constructor() {
        super();
    }
}

export class AppStore extends DSObjectStore<AppState, "appStore"> {
    constructor(value: AppState) {
        super("appStore", value);
    }

    public initializeStore(): void {
        super.initializeStore();
        this.stateValue.value.calculator = (this.storeManager! as IAppStoreManager).calculatorStore.stateValue.value;
    }
}