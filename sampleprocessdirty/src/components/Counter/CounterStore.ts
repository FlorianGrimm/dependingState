import {
    DSObjectStore,
} from "dependingState";

import { counterStoreBuilder, countDown, countUp } from "./CounterActions";
import { CounterValue } from "./CounterValue";


export class CounterStore extends DSObjectStore<CounterValue, "CounterStore"> {

    constructor(value: CounterValue) {
        super("CounterStore", value);
        counterStoreBuilder.bindValueStore(this);
    }

    public initializeStore(): void {
        super.initializeStore();

        countDown.listenEvent("countDown", (e)=>{
            this.stateValue.value.nbrValue--;
            this.stateValue.valueChanged("countDown");

        });

        countUp.listenEvent("countUp", (e)=>{
            this.stateValue.value.nbrValue++;
            this.stateValue.valueChanged("countUp");
        });
    }

    // hint3
    // public processDirty(): boolean {
    //     // needed since listenCleanedUpRelated is used
    //     super.processDirty();
    //     console.log("dirtry 1",this.stateValue.value.nbrValue);
    //     if (this.stateValue.value.nbrValue < -10){
    //         this.stateValue.value.nbrValue = 10;
    //     }
    //     if (10 < this.stateValue.value.nbrValue){
    //         this.stateValue.value.nbrValue = -10;
    //     }
    //     console.log("dirty 2",this.stateValue.value.nbrValue);
    //     return true;
    // }
}