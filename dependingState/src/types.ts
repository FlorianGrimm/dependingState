import type React from 'react';
import { StateValue } from './StateValue';

export interface IStateTransformator<TState> {
    setHasChanged(key: keyof (TState), hasChanged: boolean): void
    setResult<K extends keyof (TState)>(key: K, newValue: TState[K], hasChanged?: boolean): void;
    setPartialResult(newState: Partial<TState>, hasChanged?: boolean): void;
}

// export interface IStateTransformatorInternal<Target> {
//     getResult(): TransformatorResult<Target>;
// }

export type TransformationLink<TState> = {
    sourceName: keyof (TState);
    targetName: keyof (TState);
}

export type TransformationDefinition<TState> = {
    transformationName: string;
    sourceNames: (keyof (TState))[];
    targetNames: (keyof (TState))[];
    transformator: FnTransformator<TState>;
}

export type FnTransformator<TState> = (
    stateTransformator: IStateTransformator<TState>,
    state: TState,
) => TransformatorResult<Partial<TState>> | void;

export type ActionResultBase = (any | void);

export type PromiseActionResultOrVoid<TResult extends ActionResultBase> = TResult extends void ? Promise<void> : Promise<TResult>;

export type ActionResult<TResult extends ActionResultBase> = TResult extends void ? (void | Promise<void>) : (Promise<TResult> | TResult);

export type FnActionInvoker<
    TPayload,
    TResultType extends ActionResultBase,
    TStateKey extends string,
    TActionType extends string
    > = (
        payload: TPayload,
    ) => Promise<TActionProcessed<TPayload, TStateKey, TActionType, TResultType>>

export type FnActionHandler<TPayload, TState, TResult extends ActionResultBase> = (
    payload: TPayload,
    stateRoot: IStateRoot<TState>,
) => ActionResult<TResult>;

export interface IStateRoot<TState extends TStateBase> {
    states: TState;
    setStateHasChanged(key: keyof (TState), hasChanged: boolean): void;
    setStateDirty(key: keyof (TState)): void;
    setStateFromAction<TKey extends keyof (TState)>(key: TKey, newState: TState[TKey]): void;
    executeAction<
        TPayload = undefined,
        TActionType extends string = string,
        TStateKey extends string = string
    >(
        action: TAction<TPayload, TActionType, TStateKey>
    ): Promise<void>
}

export type TransformatorResult<TState> = {
    changed: boolean;
    result: Partial<TState>;
} | {
    changed: true;
    result: Partial<TState>;
} | {
    changed: false;
};

export type TStateBase = { [key: string]: any };

export interface IStateVersion {
    stateVersion: number;
}

export type TStateVersion = {
    stateVersion: number;
};

export type StateVersion<T = {}> = T & TStateVersion;

export type UIViewState<T = any> = T & UIViewStateBase;

export type UIViewStateBase = {
    stateVersion: number;
};

export type FnStateVersion = (() => number);

export type FnGetValue<TInstance> = (() => { instance: TInstance, stateVersion: number });
export type FnSetValue<TInstance> = ((instance: TInstance, stateVersion: number) => void);

export type FnGetStateVersion<TInstance> = ((instance: TInstance) => number);
export type FnSetStateVersion<TInstance> = ((instance: TInstance, stateVersion: number) => void);

// react props
export type UIProps<TUIProps = any> = {
    getViewProps: UIPropsGetViewProps<TUIProps>;
    // wireStateVersion(component: React.Component<TUIProps>): void;
    // unwireStateVersion(component: React.Component<TUIProps>): void;
    wireStateVersion(component: React.Component): void;
    unwireStateVersion(component: React.Component): void;
    getStateVersion(): number;
};

export type UIPropsGetViewProps<TUIPropsInner = any> = () => TUIPropsInner;

export type UIPropsBase<T> = Exclude<T, UIProps<T>>;

export interface IViewStateVersion<TUIProps = any> {
    getViewProps(): UIProps<TUIProps>;
}

export type FnStateGenerator<TState> = (that: IStateRoot<TState>) => TState;


export type TActionType<
    TStateKey extends string = string,
    TActionType extends string = string
    > = {
        state: TStateKey;
        type: TActionType;
    }

export type TAction<
    TPayload = undefined,
    TStateKey extends string = string,
    TActionType extends string = string
    > = {
        stateKey: TStateKey;
        type: TActionType;
        payload: TPayload;
    };

export type TActionProcessed<
    TPayload = undefined,
    TStateKey extends string = string,
    TActionType extends string = string,
    TResultType extends ActionResultBase = undefined
    > = {
        stateKey: TStateKey;
        type: TActionType;
        payload: TPayload;
        result?: TResultType;
        error?: any;
    };

// 2cd attempt

export type TStateValueObject = { [TKey: string]: IStateValue<any> };

//export type TStateValueObject2<TObject, TKey extends keyof TObject> = { [TKey: string]: TObject[TKey] extends IStateValue ? TObject[TKey] : never };

export interface IStateValue<TValue = any> {
    level: number;
    isDirty: boolean;
    value: TValue;

    execute(transformationProcessor: ITransformationProcessor): Promise<void>;
    setValue(transformationProcessor: ITransformationProcessor, value: TValue | undefined, hasChanged?: (boolean | undefined) /*= undefined*/): void;
    setTransformation<TSource extends TStateValueObject>(
        source: TSource,
        fnProcess: FnTransformationProcess<TValue, TSource>
        ):void;

    addSuccessor(target: IStateValue<any>):void;
    removeSuccessor(target: IStateValue<any>):void;
    getSuccessors(): IStateValue<any>[];
}

export type TInternalStateValue<TValue> = {
    stateValueBound?: IStateValueBound<TValue>;
}

export interface IStateValueBound<TValue = any> {
    execute(): Promise<void>;
}

export interface IStateManager {
    stateVersion: number;
    nextStateVersion: number;
    getLiveState<TValue>(value: IStateValue<TValue>): IStateValueBound<TValue>;
    getTransformationProcessor(): ITransformationProcessor;
}

export type FnTransformationResult<TValue>
    = (void | TValue | Promise<void> | Promise<TValue>);

export type FnTransformationProcess<TValue, TSource extends TStateValueObject>
    = ( source: TSource, 
        target: IStateValue<TValue>, 
        transformationProcessor: ITransformationProcessor
        ) => FnTransformationResult<TValue>;


export interface ITransformationProcessor {
    // stateVersion: number;
    readonly nextStateVersion: number;

    setProcessed(child: IStateValue<any>): void;
    setDirty(child: IStateValue<any>): void;
}
/*
    export type Action<
        Payload = undefined,
        ResultType = undefined,
        TState = TStateBase, 
        TKey extends keyof(TState) = keyof(TState),
        ActionType extends string = string,
        > = {
            state: TKey;
            type: ActionType;
            payload: Payload;
            result: ResultType;
        };
*/

/*
export type Action<
    Payload = void,
    ActionType extends string = string,
    Meta = never,
    Error = never> = {
        type: ActionType;
        payload: Payload;
    } & (
        [Meta] extends [never]
        ? {}
        : {
            meta: Meta;
        }
    ) & (
        [Error] extends [never]
        ? {}
        : {
            error: Error;
        }
    );
*/