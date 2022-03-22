import { DSStateValueSelf } from "dependingState";

export class CalculatorValue extends DSStateValueSelf<CalculatorValue> {
    nbrA: number;
    nbrB: number;
    nbrC: number;
    constructor() {
        super();
        this.nbrA = 1;
        this.nbrB = 1;
        this.nbrC = 0;
    }
}
