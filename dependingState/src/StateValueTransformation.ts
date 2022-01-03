import { 
    FnTransformationProcess, 
    FnTransformationResult, 
    IStateValue, 
    ITransformationProcessor, 
    TStateValueObject
} from "./types";

export class StateValueTransformation<TValue, TSource extends TStateValueObject>{
    target: IStateValue<TValue>;
    source: TSource;
    fnProcess: FnTransformationProcess<TValue, TSource>;

    constructor(
        source: TSource,
        target: IStateValue<TValue>,
        fnProcess: FnTransformationProcess<TValue, TSource>
    ) {
        this.target = target;
        this.source = source;
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