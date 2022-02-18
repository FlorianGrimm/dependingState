import {
    DSObjectStore
} from "dependingState";

import { appUIStoreBuilder, countDown, countUp } from "./AppUIActions";
import type { AppUIValue } from "./AppUIValue";

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
            this.stateValue.valueChanged("countDown");
        });      
        countUp.listenEvent("countUp",(e)=>{
            this.stateValue.value.counter++;
            this.stateValue.value.clicks++;
            this.stateValue.valueChanged("countUp");
        });      
    }

    public processDirty(): boolean {
        // needed since listenCleanedUpRelated is used
        super.processDirty();
        console.log("dirtry 1",this.stateValue.value.counter);
        if (this.stateValue.value.counter < -10){
            this.stateValue.value.counter = 10;
        }
        if (10 < this.stateValue.value.counter){
            this.stateValue.value.counter = -10;
        }
        console.log("dirty 2",this.stateValue.value.counter);
        return true;
    }
}