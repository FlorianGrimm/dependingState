import {
    DSStateValueSelf
} from "dependingState";
import type { AppState } from "~/store/AppState";
import type { RouterValue } from "../Router/RouterValue";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    appState: AppState | undefined;
    appStateStateVersion:number;
    routerValue:RouterValue|undefined;
    routerValueStateVersion:number;
    constructor() {
        super();
        this.appStateStateVersion=0;
        this.routerValueStateVersion=0;
    }
}