import type {
    TInternalStateValue,
    IStateManager,
    IStateValue,
    IStateValueBound,
    ITransformationProcessor
} from "./types";

import { StateValueBound } from "./StateValueBound";
import { TransformationProcessor } from "./TransformationProcessor";

// 2cd attempt
export class StateManager implements IStateManager {
    stateVersion: number;
    nextStateVersion: number;
    constructor() {
        this.stateVersion = 1;
        this.nextStateVersion = 2;
    }

    getLiveState<TValue>(value: IStateValue<TValue>): IStateValueBound<TValue> {
        const internalStateValue = (value as TInternalStateValue<TValue>);
        let result = internalStateValue.stateValueBound;
        if (result === undefined) {
            result = new StateValueBound<TValue>(this, value);
            internalStateValue.stateValueBound = result;
        }
        return result;
    }

    getTransformationProcessor(): ITransformationProcessor {
        this.stateVersion = (this.nextStateVersion++);
        return new TransformationProcessor(this, this.nextStateVersion);
    }
}