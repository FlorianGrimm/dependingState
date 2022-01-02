import { IStateManager, IStateValue } from "./types";
import { ITransformationProcessor } from "./types";

export class TransformationProcessor implements ITransformationProcessor {
    stateManager: IStateManager;
    constructor(stateManager: IStateManager) {
        this.stateManager = stateManager;
    }

    get nextStateVersion(): number {
        return this.stateManager.nextStateVersion;
    }

    setDirty(child: IStateValue<any>): void {
        child.isDirty = true;
    }

    setProcessed(child: IStateValue<any>): void {
        child.isDirty = false;
    }
}