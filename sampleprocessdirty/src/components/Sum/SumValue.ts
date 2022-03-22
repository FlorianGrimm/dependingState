import { DSStateValueSelf } from "dependingState";

export class SumValue extends DSStateValueSelf<SumValue> {
    sumValue: number;
    constructor() {
        super();
        this.sumValue = NaN;
    }
}
