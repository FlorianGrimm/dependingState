import {
    StateRoot,
    initStateVersion,
    FnStateGenerator,
    IStateRoot
} from "dependingState";
import { AppUIState } from "./component/App/AppView";
import { CompAUIState } from "./component/CompA/CompA";
import { CompBUIState } from "./component/CompB/CompB";

import {
    TAppStates, TStateRootAppStates
} from './types';

export class AppRootState extends StateRoot<TAppStates>{
    // constructor(initalState?: TAppStates) {
    //     super(initalState);
    // }
    constructor(initalState?: FnStateGenerator<TAppStates>) {
        super(initalState || getInitalState);
    }
}

export function getInitalState(stateRoot: TStateRootAppStates): TAppStates {
    const initalState: TAppStates = {
        uiRoot: AppUIState.getInitalState(stateRoot),
        a: CompAUIState.getInitalState(),
        b: CompBUIState.getInitalState()
    };
    return initalState;
}
