import { DSStateValueSelf } from "dependingState";

export class CounterValue extends DSStateValueSelf<CounterValue> {
    nbrValue: number;
    constructor() {
        super();
        this.nbrValue = 0;
    }
}
