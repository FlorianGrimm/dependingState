import { 
    IStateManager,
    IStateValue,
    IStateValueBound 
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

    execute(): void {
        // this.stateValue.execute(this.stateManager);
    }
}
