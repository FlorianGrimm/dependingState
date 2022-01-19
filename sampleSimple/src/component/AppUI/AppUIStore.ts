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
import { AppUIValue } from "./AppUIValue";


export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
    }

    public postAttached(): void {
        super.postAttached();

        // TODO
        /*
        this.combineValueStateFromObjectStore(
            "calculator",
            ()=>(this.storeManager! as IAppStoreManager).calculatorStore
        );
        */
        const calculatorStore = (this.storeManager! as IAppStoreManager).calculatorStore;
        this.stateValue.value.calculator = calculatorStore.stateValue.value;
        this.stateValue.value.calculatorStateVersion = calculatorStore.stateValue.stateVersion;
        calculatorStore.listenDirtyRelated(this.storeName, this);
        calculatorStore.listenEventValue(`${this.storeName} sets dirty`, (e) => {
            const properties = e.payload.properties;
            if ((properties === undefined)
                || (properties.has("nbrA"))
                || (properties.has("nbrB"))
                || (properties.has("nbrC"))
            ) {
                this.processDirty();
            }
        })
    }


    public processDirty(): void {
        super.processDirty();

        const calculatorStore = (this.storeManager! as unknown as IAppStoreManager).calculatorStore;
        const stateValuePC = getPropertiesChanged(this.stateValue);
        // is it mutable? may be not needed
        stateValuePC.setIf("calculator", calculatorStore.stateValue.value);
        stateValuePC.setIf("calculatorStateVersion", calculatorStore.stateValue.stateVersion);
        stateValuePC.valueChangedIfNeeded();
    }
}