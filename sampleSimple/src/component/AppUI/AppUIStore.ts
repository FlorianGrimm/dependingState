import {
    DSObjectStore
} from "dependingState";

import { appUIStoreBuilder, countDown, countUp } from "./AppUIActions";
import { AppUIValue } from "./AppUIValue";

export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        appUIStoreBuilder.bindValueStore(this);
    }

    public initializeStore(): void {
        super.initializeStore();

        countDown.listenEvent("countDown",(e)=>{
            this.stateValue.value.counter--;
            this.stateValue.value.clicks++;
            this.stateValue.valueChanged();
            // valueChanged triggers the update of the ui or depending objects
        });      
        countUp.listenEvent("countUp",(e)=>{
            this.stateValue.value.counter++;
            this.stateValue.value.clicks++;
            // hint1
        });      
    }
}