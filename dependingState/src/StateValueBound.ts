import {
    IStateManager,
    IStateValue,
    IStateValueBound,
    ITransformationProcessor
} from "./types";

// 2cd attempt

export class StateValueBound<TValue> implements IStateValueBound<TValue> {
    stateManager: IStateManager;
    stateValue: IStateValue<TValue>;

    constructor(
        stateManager: IStateManager,
        stateValue: IStateValue<TValue>
    ) {
        this.stateManager = stateManager;
        this.stateValue = stateValue;
    }

    execute(): Promise<void> {
        const transformationProcessor: ITransformationProcessor = this.stateManager.getTransformationProcessor();
        return this.stateValue.execute(transformationProcessor);
    }
}
