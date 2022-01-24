import { DSStateValueSelf } from "dependingState";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    name: string;
    greeting: string;
    constructor() {
        super();
        this.name = "";
        this.greeting = "";
    }
}