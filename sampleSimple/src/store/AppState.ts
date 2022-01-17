import { DSObjectStore, DSStateValueSelf } from "dependingState";
import type { CalculatorValue } from "~/component/Calculator/CalculatorValue";
import { IAppStoreManager } from "./AppStoreManager";

export class AppState extends DSStateValueSelf<AppState> {
    public calculator: CalculatorValue|undefined;

    constructor() {
        super();
    }
}

export class AppStore extends DSObjectStore<AppState, AppState, "appStore"> {
    constructor(value: AppState) {
        super("appStore", value);
    }

    public postAttached(): void {
        super.postAttached();
        this.stateValue.calculator=        (this.storeManager! as IAppStoreManager).calculatorStore.stateValue;
    }
}