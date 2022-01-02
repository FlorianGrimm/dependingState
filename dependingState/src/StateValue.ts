import {
    FnTransformationProcess,
    FnTransformationResult,
    IStateValue,
    ITransformationProcessor,
    TStateValueObject
    //TStateValueObject2
} from "./types";

import { deepEquals } from ".";
import { HasChanged } from "./HasChanged";

// 2cd attempt

export class StateValue<TValue = any> implements IStateValue<TValue>{
    value: TValue | undefined;
    isDirty: boolean;
    stateVersion: number;
    transformation: StateValueTransformation<TValue, any> | undefined;
    level:number;

    constructor(value: TValue) {
        this.value = value;
        this.isDirty = true;
        this.stateVersion = 0;
        this.level=0;
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
                            //
                            this.setValue(transformationProcessor, value, undefined);
                        }
                        return;
                    }
                )
            }
            {
                this.setValue(transformationProcessor, result as TValue, undefined);
                return Promise.resolve();
            }
        }
    }

    setHasChanged(hasChanged: boolean, transformationProcessor: ITransformationProcessor) {
        this.isDirty = false;
        if (hasChanged && this.transformation !== undefined) {
            this.transformation.setChildrenDirty(transformationProcessor);
        }
    }

    setValue(transformationProcessor: ITransformationProcessor, value: TValue | undefined, changed: boolean | undefined = undefined): void {
        if (changed === undefined) {
            changed = deepEquals(this.value, value, true);
        }
        if (changed === false) {
            return;
        } else {
            this.stateVersion = transformationProcessor.nextStateVersion;
            this.value = value;
            transformationProcessor.setProcessed(this);
        }
    }

    setTransformation<TSource extends TStateValueObject>(
        source: TSource,
        fnProcess: FnTransformationProcess<TValue, TSource> //(source: TSource, target: IStateValue<TValue>) => (void | TValue | Promise<void> | Promise<TValue>)
    ) {
        this.transformation = new StateValueTransformation<TValue, TSource>(source, this, fnProcess);
        this.isDirty = true;
        this.transformation.setLevel();
    }
}

export class StateValueTransformation<TValue, TSource extends TStateValueObject>{
    target: StateValue<TValue>;
    source: TSource;
    fnProcess: FnTransformationProcess<TValue, TSource>;

    constructor(
        source: TSource,
        target: StateValue<TValue>,
        fnProcess: FnTransformationProcess<TValue, TSource>
    ) {
        this.target = target;
        this.source = source;
        this.fnProcess = fnProcess;
    }

    process(transformationProcessor: ITransformationProcessor): FnTransformationResult<TValue> {
        return this.fnProcess(this.source, this.target, transformationProcessor);
    }

    setChildrenDirty(transformationProcessor: ITransformationProcessor) {
        for (const key in this.source) {
            if (Object.prototype.hasOwnProperty.call(this.source, key)) {
                const child = this.source[key] as IStateValue;
                transformationProcessor.setDirty(child);
            }
        }
    }

    setLevel() {
        let level=1;
        for (const key in this.source) {
            if (Object.prototype.hasOwnProperty.call(this.source, key)) {
                const child = this.source[key] as IStateValue;
                child.level
            }
        }
        this.target.level=1;
        throw new Error("Method not implemented.");
    }

}