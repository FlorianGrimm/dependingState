import { DSStateValueSelf } from "dependingState";

export class TimerValue extends DSStateValueSelf<TimerValue> {
    counter: number;
    constructor() {
        super();
        this.counter = 0;
    }
}