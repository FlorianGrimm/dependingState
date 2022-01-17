import {
    DSStateValueSelf
} from "dependingState";
import type { CalculatorValue } from "~/component/Calculator/CalculatorValue";

export class AppViewValue extends DSStateValueSelf<AppViewValue> {
    calculator: CalculatorValue | undefined;
    calculatorStateVersion: number;
    constructor() {
        super();
        this.calculatorStateVersion=0;
    }
}