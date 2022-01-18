import {
    DSStateValueSelf
} from "dependingState";
import type { CalculatorValue } from "~/component/Calculator/CalculatorValue";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    calculator: CalculatorValue | undefined;
    calculatorStateVersion: number;
    constructor() {
        super();
        this.calculatorStateVersion=0;
    }
}