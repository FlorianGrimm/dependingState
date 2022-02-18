import { DSStateValueSelf } from "dependingState";

export class CalculatorStyleValue extends DSStateValueSelf<CalculatorStyleValue>{
    rootStyle: React.CSSProperties;
    constructor() {
        super();
        this.rootStyle = {};
    }
}