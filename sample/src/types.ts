import { StateVersion } from "dependingState";
import type { AppUIState } from "./component/App/AppView";

export type TAppStates = {
    uiRoot: StateVersion<AppUIState>,
    a: StateVersion<TAppState1A>,
    b: StateVersion<TAppState1B>,
}

export type TAppState1A = {
    a1: number;
    a2: number;
    stateVersion: number;
}

export type TAppState1B = {
    b1: number;
    b2: number;
    stateVersion: number;
}