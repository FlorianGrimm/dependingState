import { deepEquals } from "./deepEquals";
import { StateRoot } from "./StateRoot";
import {
    IStateTransformator
} from "./types";

export class StateTransformator<TState = any> 
    implements IStateTransformator<TState> {
    readonly stateRoot: StateRoot<TState>;

    constructor(
        stateRoot: StateRoot<TState>
    ) {
        this.stateRoot = stateRoot;
    }
    setHasChanged(key:keyof(TState), hasChanged: boolean):void{
        if (hasChanged){
            this.stateRoot.setStateFromTransformator(key, this.stateRoot.states[key]);
        } else {
            this.stateRoot.clearDirtyFromTransformator(key);
        }
    }
    setResult<TKey extends keyof(TState)>(key:TKey, newValue:TState[TKey], hasChanged?:boolean):void{
        if (hasChanged === false){
            this.stateRoot.clearDirtyFromTransformator(key);
            return;
        } 
        if (hasChanged === undefined){
            hasChanged = !deepEquals(newValue, this.stateRoot.states[key], true);
        }
        if (hasChanged){
            this.stateRoot.setStateFromTransformator(key, newValue);
        }
    }
    setPartialResult(newState: Partial<TState>, hasChanged?:boolean): void {
        if (hasChanged === false){
            for (const key in newState) {
                if (Object.prototype.hasOwnProperty.call(newState, key)) {
                    this.stateRoot.clearDirtyFromTransformator(key);
                }
            }
            return ;
        } else {
            for (const key in newState) {
                if (Object.prototype.hasOwnProperty.call(newState, key)) {
                    const newSubState = newState[key];
                    if ((hasChanged === true) || (!deepEquals(newSubState, this.stateRoot.states[key], true))) {
                        this.stateRoot.setStateFromTransformator(key, newSubState!);
                    }
                }
            }
        }
    }
}