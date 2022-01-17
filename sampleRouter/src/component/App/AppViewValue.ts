import {
    DSStateValueSelf
} from "dependingState";
import { AppState } from "~/store/AppState";

export class AppViewValue extends DSStateValueSelf<AppViewValue> {
    appState: AppState | undefined;
    constructor() {
        super();
    }
}