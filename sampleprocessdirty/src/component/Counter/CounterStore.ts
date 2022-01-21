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

    public postAttached(): void {
        super.postAttached();

        countDown.listenEvent("countDown", (e)=>{
            this.stateValue.value.nbrValue--;
            this.stateValue.valueChanged();

        });

        countUp.listenEvent("countUp", (e)=>{
            this.stateValue.value.nbrValue++;
            this.stateValue.valueChanged();
        });
    }
}