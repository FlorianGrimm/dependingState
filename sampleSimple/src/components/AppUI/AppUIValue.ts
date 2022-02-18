import {
    DSStateValueSelf
} from "dependingState";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    counter: number;
    clicks: number;

    constructor() {
        super();

        this.counter = 0;
        this.clicks = 0;
    }
}