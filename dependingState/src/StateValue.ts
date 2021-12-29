import { deepEquals } from ".";
import { StateManager } from "./StateManager";

export class StateValue<TValue = any>{
    value: TValue | undefined;
    isDirty: boolean;
    stateVersion: number;

    constructor() {
        this.isDirty = true;
        this.stateVersion = 0;
    }

    execute(stateManager: StateManager) {
        if (this.isDirty) {
            this.process();
            this.isDirty = false;
        }
    }

    process() {
    }

    setValue(stateManager: StateManager, value: TValue | undefined, changed: boolean | undefined = undefined) {
        if (changed === undefined) {
            changed = deepEquals(this.value, value, true);
        }
        if (changed === false) {
            return;
        } else {
            this.isDirty = false;
            this.stateVersion = stateManager.nextStateVersion;
            this.value = value;
        }
    }

    // addParameterDependency<TParameter>(parameter:StateValue<TParameter>){ }
}