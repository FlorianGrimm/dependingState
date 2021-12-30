import {
    IStateManager,
    IStateValue
} from "./types";

import { deepEquals } from ".";

// 2cd attempt

export class StateValue<TValue = any> implements IStateValue<TValue>{
    value: TValue | undefined;
    isDirty: boolean;
    stateVersion: number;

    constructor() {
        this.isDirty = true;
        this.stateVersion = 0;
    }

    execute(stateManager: IStateManager) {
        if (this.isDirty) {
            this.process();
            this.isDirty = false;
        }
    }

    process() {
    }

    setValue(stateManager: IStateManager, value: TValue | undefined, changed: boolean | undefined = undefined): void {
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