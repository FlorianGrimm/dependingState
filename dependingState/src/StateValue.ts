import {
    FnTransformationProcess,
    IStateValue,
    ITransformationProcessor,
    TStateValueObject
} from "./types";

import { deepEquals } from ".";
import { HasChanged } from "./HasChanged";
import { StateValueTransformation } from "./StateValueTransformation";

// 2cd attempt

export class StateValue<TValue = any> implements IStateValue<TValue>{
    value: TValue;
    isDirty: boolean;
    stateVersion: number;
    transformation: StateValueTransformation<TValue, any> | undefined;
    level: number;
    arrSucc: IStateValue<any>[];

    constructor(value: TValue) {
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
        if (this.transformation === undefined) {
            return Promise.resolve();
        } else {
            var result = this.transformation.process(transformationProcessor);
            if (result === undefined) {
                return Promise.resolve();
            }
            if (result instanceof HasChanged) {
                this.setHasChanged(result.hasChanged, transformationProcessor);
                return Promise.resolve();
            }
            if (typeof (result as any).then === "function") {
                return (result as Promise<void | TValue>).then(
                    (value) => {
                        if (value === undefined) {
                            //
                        } else {
                            this.setValue(transformationProcessor, value, undefined);
                        }
                        return;
                    }
                )
            }
            {
                this.setValue(transformationProcessor, result as unknown as TValue, undefined);
                return Promise.resolve();
            }
        }
    }

    setHasChanged(hasChanged: boolean, transformationProcessor: ITransformationProcessor) {
        if (this.transformation === undefined){
            this.isDirty = false;
        } else{
            transformationProcessor.setProcessed(this);
            if (hasChanged) {
                this.transformation.setSuccessorsDirty(transformationProcessor);
            }
        }
    }

    setValue(transformationProcessor: ITransformationProcessor, value: TValue | undefined, hasChanged: boolean | undefined = undefined): void {
        if (value === undefined){
            transformationProcessor.setProcessed(this);
            if (hasChanged === true){
                if (this.transformation!==undefined){
                    this.transformation.setSuccessorsDirty(transformationProcessor);
                }
            }
            return;
        }
        if (hasChanged === undefined) {
            hasChanged = deepEquals(this.value, value, true);
        }
        if (hasChanged === false) {
            return;
        } else {
            this.stateVersion = transformationProcessor.nextStateVersion;
            this.value = value;
            transformationProcessor.setProcessed(this);
            if (this.transformation!==undefined){
                this.transformation.setSuccessorsDirty(transformationProcessor);
            }
        }
    }

    setTransformation<TSource extends TStateValueObject>(
        source: TSource,
        fnProcess: FnTransformationProcess<TValue, TSource> //(source: TSource, target: IStateValue<TValue>) => (void | TValue | Promise<void> | Promise<TValue>)
    ): void {
        if (this.transformation !== undefined) {
            this.transformation.unregister();
            this.transformation = undefined;
        }
        this.transformation = new StateValueTransformation<TValue, TSource>(source, this, fnProcess);
        this.isDirty = true;
        this.transformation.register(true);
    }

    getSuccessors(): IStateValue<any>[]{
        return this.arrSucc;
    }

    addSuccessor(target: StateValue<any>): void {
        this.arrSucc = this.arrSucc.concat([target]);
    }

    removeSuccessor(target: StateValue<any>): void {
        this.arrSucc = this.arrSucc.filter((item) => (item !== target));
    }
}