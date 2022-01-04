import {
    FnTransformationProcess,
    IStateValue,
    IStateValueTransformation,
    ITransformationProcessor,
    FnTransformationResult,
    TStateValueObject
} from "./types";


import { deepEquals } from ".";
import { HasChanged } from "./HasChanged";
import { StateValueBase } from "./StateValueBase";

// 2cd attempt
export class StateValue<TValue = any> extends StateValueBase<TValue> implements IStateValue<TValue>{
    transformation: StateValueTransformation<TValue, any> | undefined;

    constructor(value: TValue) {
        super(value);
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
        if (this.transformation === undefined) {
            this.isDirty = false;
        } else {
            transformationProcessor.setProcessed(this);
            if (hasChanged) {
                this.transformation.setSuccessorsDirty(transformationProcessor);
            }
        }
    }

    setValue(transformationProcessor: ITransformationProcessor, value: TValue | undefined, hasChanged: boolean | undefined = undefined): void {
        if (value === undefined) {
            transformationProcessor.setProcessed(this);
            if (hasChanged === true) {
                if (this.transformation !== undefined) {
                    this.transformation.setSuccessorsDirty(transformationProcessor);
                }
            }
            return;
        }
        if (hasChanged === undefined) {
            hasChanged = !deepEquals(this.value, value, true);
        }
        if (hasChanged === false) {
            return;
        } else {
            this.stateVersion = transformationProcessor.nextStateVersion;
            this.value = value;
            // this.setValueInternal(value);
            transformationProcessor.setProcessed(this);
            if (this.transformation !== undefined) {
                this.transformation.setSuccessorsDirty(transformationProcessor);
            }
        }
    }

    // setValueInternal(value:TValue){
    //     this.value = value;
    // }

    setTransformation<TSource extends TStateValueObject>(
        source: TSource,
        fnProcess: FnTransformationProcess<TValue, TSource>
    ): void {
        if (this.transformation !== undefined) {
            this.transformation.unregister();
            this.transformation = undefined;
        }
        this.transformation = new StateValueTransformation<TValue, TSource>(source, this, fnProcess);
        this.isDirty = true;
        this.transformation.register(true);
    }

    getSuccessors(): IStateValue<any>[] {
        return this.arrSucc;
    }

    addSuccessor(target: StateValue<any>): void {
        this.arrSucc = this.arrSucc.concat([target]);
    }

    removeSuccessor(target: StateValue<any>): void {
        this.arrSucc = this.arrSucc.filter((item) => (item !== target));
    }
}


class StateValueTransformation<TValue, TSource extends TStateValueObject>
    implements IStateValueTransformation<TValue, TSource>
{
    source: TSource;
    target: IStateValue<TValue>;
    fnProcess: FnTransformationProcess<TValue, TSource>;

    constructor(
        source: TSource,
        target: IStateValue<TValue>,
        fnProcess: FnTransformationProcess<TValue, TSource>
    ) {
        this.source = source;
        this.target = target;
        this.fnProcess = fnProcess;
    }

    process(transformationProcessor: ITransformationProcessor): Promise<TValue | void> {
        let pProcess: FnTransformationResult<TValue>;
        try {
            pProcess = this.fnProcess(this.source, this.target, transformationProcessor);
        } catch (error) {
            return Promise.reject(error);
        }
        if (pProcess === undefined) {
            return Promise.resolve();
        }
        if (typeof (pProcess as any).then === "function") {
            return pProcess as Promise<void>;
        } else {
            return Promise.resolve(pProcess as TValue);
        }
    }

    setSuccessorsDirty(transformationProcessor: ITransformationProcessor) {
        for (const child of this.target.getSuccessors()) {
            transformationProcessor.setDirty(child);
        }
    }

    register(register: boolean = false): boolean {
        let level = 1;
        for (const key in this.source) {
            if (Object.prototype.hasOwnProperty.call(this.source, key)) {
                const srcValue = this.source[key] as IStateValue;
                if (level <= srcValue.level) {
                    level = srcValue.level + 1;
                }
                if (register) {
                    srcValue.addSuccessor(this.target);
                }
            }
        }
        if (level < this.target.level) {
            this.target.level = level;
            return true;
        } else {
            return false;
        }
    }

    unregister(): void {
        for (const key in this.source) {
            if (Object.prototype.hasOwnProperty.call(this.source, key)) {
                const srcValue = this.source[key] as IStateValue;
                srcValue.removeSuccessor(this.target);
            }
        }
    }

}