import {
    DSObjectStore,
    getPropertiesChanged
} from "dependingState";
import type { IAppStoreManager } from "~/services/AppStoreManager";
import { AppUIValue } from "./AppUIValue";


export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
    }

    public initializeStore(): void {
        super.initializeStore();

        // TODO
        /*
        this.combineValueStateFromObjectStore(
            "calculator",
            ()=>(this.storeManager! as IAppStoreManager).calculatorStore
        );
        */
        const value = this.stateValue.value;
        const calculatorStore = (this.storeManager! as IAppStoreManager).calculatorStore;

        value.calculator = calculatorStore.stateValue.value;
        // is calculator mutable? and never replaced -> not needed

        // value.calculatorStateVersion = calculatorStore.stateValue.stateVersion;

        // calculatorStore.listenCleanedUpRelated(this.storeName, this);
        // calculatorStore.listenEventValue(`${this.storeName} sets dirty`, (e) => {
        //     const properties = e.payload.properties;
        //     if ((properties === undefined)
        //         || (properties.has("nbrA"))
        //         || (properties.has("nbrB"))
        //         || (properties.has("nbrC"))
        //     ) {
        //         //this.processDirty();
        //         this.isDirty=true;
        //     }
        // });
    }


    // public processDirty(): void {
    //     super.processDirty();

    //     const calculatorStore = (this.storeManager! as unknown as IAppStoreManager).calculatorStore;
    //     const stateValuePC = getPropertiesChanged(this.stateValue);
    //     stateValuePC.setIf("calculator", calculatorStore.stateValue.value);
    //     stateValuePC.setIf("calculatorStateVersion", calculatorStore.stateValue.stateVersion);
    //     stateValuePC.valueChangedIfNeeded();
    // }
}
