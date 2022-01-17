import {
    dsLog,
    DSObjectStore,
    DSStateValue,
    DSStateValueSelf,
    DSUIProps,
    DSUIViewStateBase,
    getPropertiesChanged,
    IDSStateValue,
    IDSValueStore
} from "dependingState";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { AppViewValue } from "./AppViewValue";


export class AppViewStore extends DSObjectStore<AppViewValue, AppViewValue, "appViewStore"> {
    constructor(value: AppViewValue) {
        super("appViewStore", value);
    }

    public postAttached(): void {
        super.postAttached();

        this.combineValueStateFromObjectStore(
            "calculator",
            ()=>(this.storeManager! as IAppStoreManager).calculatorStore
        );
        const calculatorStore = (this.storeManager! as IAppStoreManager).calculatorStore;
        this.stateValue.calculator = calculatorStore.stateValue;
        this.stateValue.calculatorStateVersion = calculatorStore.stateVersion;
        calculatorStore.listenDirtyRelated(this.storeName, this);
        calculatorStore.listenEventValue("", (e) => {
            this.processDirty();
        })
    }


    public processDirty(): void {
        super.processDirty();

        const calculatorStore = (this.storeManager! as unknown as IAppStoreManager).calculatorStore;
        const stateValuePC = getPropertiesChanged(this.stateValue);
        // is it mutable? may be not needed
        stateValuePC.setIf("calculator", calculatorStore.stateValue);
        stateValuePC.setIf("calculatorStateVersion", calculatorStore.stateVersion);
        stateValuePC.valueChangedIfNeeded();
    }
}