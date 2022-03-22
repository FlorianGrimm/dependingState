import {
    DSStateValueSelf
} from "dependingState";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    startTime: string;
    constructor() {
        super();
        this.startTime = "";
    }
}
