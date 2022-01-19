import {
    IDSStateValue,
    DSStateValueSelf
} from "dependingState";
import type { AppState } from "~/store/AppState";
import type { NavigatorValue } from "~/component/Navigator/NavigatorValue";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    appState: IDSStateValue<AppState> | undefined;
    appStateStateVersion: number;
    navigatorValue: IDSStateValue<NavigatorValue> | undefined;
    navigatorValueStateVersion: number;
    constructor() {
        super();
        this.appStateStateVersion = 0;
        this.navigatorValueStateVersion = 0;
    }
}