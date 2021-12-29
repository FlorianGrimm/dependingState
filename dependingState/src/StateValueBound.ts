import { StateManager } from "./StateManager";
import { StateValue } from "./StateValue";

export class StateValueBound<TValue>{
    stateManager: StateManager;
    stateValue: StateValue<TValue>;

    constructor(
        stateManager: StateManager,
        stateValue: StateValue<TValue>
    ) {
        this.stateManager = stateManager;
        this.stateValue = stateValue;
    }

    execute() {
        this.stateValue.execute(this.stateManager);
    }
}
