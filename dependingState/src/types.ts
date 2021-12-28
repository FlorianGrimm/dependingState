import type React from 'react';

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
    transformator: Transformator<TState>;
}

export type Transformator<TState> = (
    stateTransformator: IStateTransformator<TState>,
    state: TState,
) => TransformatorResult<Partial<TState>> | void;

export type ActionInvoker<TPayload, TResult extends Promise<any | void> | void> = (
    payload: TPayload,
) => TResult;

export type ActionHandler<TPayload, TState, TResult extends Promise<any | void> | void> = (
    payload: TPayload,
    stateRoot: IStateRoot<TState>,
) => TResult;

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
        TState, 
        TStateKey extends keyof(TState),
        ActionType extends string = string
    >={
    state: TStateKey;
    type: ActionType
}

export type TAction<
    TPayload = undefined,
    TActionType extends string = string,
    TStateKey extends string = string
    > = {
        state: TStateKey;
        type: TActionType;
        payload: TPayload;
    };

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