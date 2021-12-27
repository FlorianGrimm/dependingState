import type { IStateRoot, StateVersion } from "dependingState";
import type { AppUIState } from "./component/App/AppView";
import type { CompAUIState } from "./component/CompA/CompA";
import type { CompBUIState } from "./component/CompB/CompB";

export type TAppStates = {
    uiRoot: StateVersion<AppUIState>,
    a: CompAUIState,
    b: CompBUIState,
    
    // a: StateVersion<TAppState1A>,
    // b: StateVersion<TAppState1B>,
    
}

export type TStateRootAppStates = IStateRoot<TAppStates>;

// export type TAppState1A = {
//     a1: number;
//     a2: number;
//     stateVersion: number;
// }

// export type TAppState1B = {
//     b1: number;
//     b2: number;
//     stateVersion: number;
// }
