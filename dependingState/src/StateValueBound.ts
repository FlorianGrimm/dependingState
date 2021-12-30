import { StateManager } from "./StateManager";
import { 
    IStateValue,
    IStateValueBound 
} from "./types";

// 2cd attempt

export class StateValueBound<TValue> implements IStateValueBound<TValue> {
    stateManager: StateManager;
    stateValue: IStateValue<TValue>;

    constructor(
        stateManager: StateManager,
        stateValue: IStateValue<TValue>
    ) {
        this.stateManager = stateManager;
        this.stateValue = stateValue;
    }

    execute(): void {
        this.stateValue.execute(this.stateManager);
    }
}
