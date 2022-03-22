import {
    DSStateValueSelf
} from "dependingState";

import type { CalculatorValue } from "~/components/Calculator/CalculatorValue";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    calculator: CalculatorValue | undefined;

    // is calculator mutable? and never replaced -> not needed
    // calculatorStateVersion: number;

    constructor() {
        super();

        // this.calculatorStateVersion=0;
    }
}
