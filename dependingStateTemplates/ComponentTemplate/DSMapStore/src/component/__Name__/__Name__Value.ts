import { DSStateValueSelf } from "dependingState";

import type { AppState } from "~/store/AppState";
import type { AppViewProjectsUIStateValue } from "../AppUIProjects/AppUIProjectsValue";

export class AppUIValue extends DSStateValueSelf<AppUIValue> {
    appState: AppState | undefined;
    appViewProjectsUIStateValue:AppViewProjectsUIStateValue|undefined;

    constructor() {
        super();
    }
}