import { DSStateValueSelf } from "dependingState";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    isRunnging: boolean;
    constructor() {
        super();
        this.isRunnging = false;
    }
}