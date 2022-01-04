import {
    IStateValue,
    IStateValueTransformation,
    ITransformationProcessor
} from "./types";
//
var _identity: number = 0;
//
export class StateValueBase<TValue = any> {
    identity: number;
    value: TValue;
    isDirty: boolean;
    stateVersion: number;
    level: number;
    arrSucc: IStateValue<any>[];

    constructor(value: TValue) {
        this.identity = _identity++;
        this.value = value;
        this.isDirty = true;
        this.stateVersion = 0;
        this.level = 0;
        this.arrSucc = [];
    }

    execute(transformationProcessor: ITransformationProcessor): Promise<void> {
        if (this.isDirty) {
            this.isDirty = false;
            var result = this.process(transformationProcessor);
            return result;
        } else {
            return Promise.resolve();
        }
    }

    process(transformationProcessor: ITransformationProcessor): Promise<void> {
        throw "NYI";
    }

    setHasChanged(hasChanged: boolean, transformationProcessor: ITransformationProcessor) {
        throw "NYI";
    }


    setValue(transformationProcessor: ITransformationProcessor, value: TValue | undefined, hasChanged: boolean | undefined = undefined): void {
        throw "NYI";
    }

    getSuccessors(): IStateValue<any>[] {
        return this.arrSucc;
    }

    addSuccessor(successor: IStateValue<any>): void {
        this.arrSucc = this.arrSucc.concat([successor]);
    }

    removeSuccessor(successor: IStateValue<any>): void {
        this.arrSucc = this.arrSucc.filter((item) => (item !== successor));
    }
}