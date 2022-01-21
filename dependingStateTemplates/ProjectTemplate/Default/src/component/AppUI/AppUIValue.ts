import {
    IDSStateValue,
    DSStateValueSelf
} from "dependingState";
import type { NavigatorValue } from "~/component/Navigator/NavigatorValue";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    constructor() {
        super();
    }
}