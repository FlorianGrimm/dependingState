import { IStateManager, IStateValue } from "./types";
import { ITransformationProcessor } from "./types";

export class TransformationProcessor implements ITransformationProcessor {
    stateManager: IStateManager;
    nextStateVersion: number;
    constructor(
        stateManager: IStateManager,
        nextStateVersion: number) {
        this.stateManager = stateManager;
        this.nextStateVersion = nextStateVersion;
    }

    // get nextStateVersion(): number {
    //     return this.stateManager.nextStateVersion;
    // }

    setDirty(child: IStateValue<any>): void {
        child.isDirty = true;
    }

    setProcessed(child: IStateValue<any>): void {
        child.isDirty = false;
    }
}