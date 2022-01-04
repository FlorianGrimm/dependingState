import {
    IStateValue,
    IStateValueTransformation,
    ITransformationProcessor,
    StateArrayChanged
} from './types';

import { StateValue } from "./StateValue"
import { StateValueBase } from "./StateValueBase";

export class StateArray<TItem> extends StateValueBase<IStateValue<TItem>[]>
    implements IStateValue<IStateValue<TItem>[]>
{
    // arrTarget: IStateValue<TItem>[];
    // arrTargetIndex: number[];
    transformation: StateArrayTransformation<TItem, any> | undefined;
    changed: StateValue<StateArrayChanged<TItem>>;

    constructor() {
        super([]);
        this.changed = new StateValue<StateArrayChanged<TItem>>({ changed: [] });
        // this.arrTarget = [];
        // this.arrTargetIndex = [];
    }


    /*
    setValue(
        transformationProcessor: ITransformationProcessor,
        value: TItem[] | undefined,
        hasChanged: boolean | undefined = undefined
        ): void {
    }
    */

    // setValueInternal(value:TItem[]){
    //     this.value = value;
    // }

    setArrayTransformation<TSource>(
        source: StateArray<TSource>,
        fnCreate: () => StateValue<TItem>,
        fnProcess: (srcItem: IStateValue<TSource>, targetItem: IStateValue<TItem>, transformationProcessor: ITransformationProcessor) => (void | boolean)
    ) {
        if (this.transformation !== undefined) {
            this.transformation.unregister();
            this.transformation = undefined;
        }
        const transformation = new StateArrayTransformation<TItem, TSource>(source, this, fnCreate, fnProcess);
        this.transformation = transformation;
        this.isDirty = true;
        transformation.register(true);
    }
}

class StateArrayTransformation<TValue, TSource>
    implements IStateValueTransformation<TValue[], TSource>
{
    source: StateArray<TSource>;
    target: StateArray<TValue>;
    fnCreate: () => IStateValue<TValue>;
    fnProcess: (srcItem: IStateValue<TSource>, targetItem: IStateValue<TValue>, transformationProcessor: ITransformationProcessor) => (void | boolean);

    constructor(
        source: StateArray<TSource>,
        target: StateArray<TValue>,
        fnCreate: () => StateValue<TValue>,
        fnProcess: (srcItem: IStateValue<TSource>, targetItem: IStateValue<TValue>, transformationProcessor: ITransformationProcessor) => (void | boolean)
    ) {
        this.source = source;
        this.target = target;
        this.fnCreate = fnCreate;
        this.fnProcess = fnProcess;
    }


    process(transformationProcessor: ITransformationProcessor): Promise<TValue[] | void> {
        let idxTarget = 0;
        const changed: IStateValue<TValue>[] = [];
        for (let idxSource = 0; idxSource < this.source.value.length; idxSource++) {
            const srcItem = this.source.value[idxSource];
            let newOrOld: boolean;
            let result: (void | boolean);
            let targetItem: IStateValue<TValue>;
            if (idxTarget < this.target.value.length) {
                newOrOld = true;
                targetItem = this.fnCreate();
                result = this.fnProcess(srcItem, targetItem, transformationProcessor);
            } else {
                newOrOld = false;
                targetItem = this.target.value[idxTarget];
                result = this.fnProcess(srcItem, targetItem, transformationProcessor);
            }
            if (result) {
                result = true;
            }
            if (newOrOld) {
                if (result) {
                    // yes && created -> add
                    this.target.value[idxTarget] = targetItem;
                    targetItem.addSuccessor(this.target.changed);
                    changed.push(targetItem);
                } else {
                    // no && created -> skip
                }
            } else {
                if (result) {
                    // yes && existing -> ok
                    changed.push(targetItem);
                } else {
                    // no && existing -> remove
                    if (idxTarget < this.target.value.length) {
                        this.target.value.splice(idxTarget, 1);
                        targetItem.removeSuccessor(this.target.changed);
                    }
                }
            }
        }
        if (changed.length>0){
            this.target.changed.setValue(transformationProcessor, { changed: changed }, true);
        } else {
            if (this.target.changed.value.changed.length>0){
                this.target.changed.setValue(transformationProcessor, { changed: changed }, true);
            }
        }
        return Promise.resolve();
    }

    setSuccessorsDirty(transformationProcessor: ITransformationProcessor) {
        for (const child of this.target.getSuccessors()) {
            transformationProcessor.setDirty(child);
        }
    }

    register(register: boolean = false): boolean {
        // let level = 1;
        // for (const key in this.source) {
        //     if (Object.prototype.hasOwnProperty.call(this.source, key)) {
        //         const srcValue = this.source[key] as IStateValue;
        //         if (level <= srcValue.level) {
        //             level = srcValue.level + 1;
        //         }
        //         if (register) {
        //             srcValue.addSuccessor(this.target);
        //         }
        //     }
        // }
        // if (level < this.target.level) {
        //     this.target.level = level;
        //     return true;
        // } else {
             return false;
        // }
    }

    unregister(): void {
        // for (const key in this.source) {
        //     if (Object.prototype.hasOwnProperty.call(this.source, key)) {
        //         const srcValue = this.source[key] as IStateValue;
        //         srcValue.removeSuccessor(this.target);
        //     }
        // }
    }

}