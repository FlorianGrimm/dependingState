import { 
    StateRoot,
    initStateVersion
 } from "dependingState";
import { AppUIState } from "./component/App/AppView";

 import{
    TAppStates
} from './types';

export class AppRootState extends StateRoot<TAppStates>{
    constructor(initalState?: TAppStates) {
        super(initalState);
    }
}

export function getInitalState(): TAppStates {
    const initalState: TAppStates = {
        uiRoot:AppUIState.getInitalState(),
        a: initStateVersion({
            a1: 0,
            a2: 0
        }),
        b: initStateVersion({
            b1: 0,
            b2: 0
        })
    };
    return initalState;
}
