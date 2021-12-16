import {
    Transformator,
    TransformationDefinition,
    TStateBase,
    IStateTransformator,
    ActionHandler,
    ActionInvoker,
    IStateRoot
} from "./types";

import { StateTransformator } from "./StateTransformator";

type TProcessState<TState extends TStateBase> = {
    stateName: keyof (TState);
    mapSuccDirty: Map<keyof (TState), TProcessState<TState>>;
    isDirty: boolean;
    stateVersion: number;
    arrTransformator: TArrayTransformatorDefinition<TState>;
    arrSideEffect: ((state: any) => void)[];
}

type TArrayTransformatorDefinition<TState extends TStateBase> = (TTransformatorDefinition<TState>)[];

type TTransformatorDefinition<TState extends TStateBase> = {
    transformationName: string;
    transformator: Transformator<TState>;
}

type TStateDefinition<TState extends TStateBase> = {
    key: keyof (TState);
    prev: Map<keyof (TState), TStateDefinition<TState>>;
    succ: Map<keyof (TState), TStateDefinition<TState>>;
    level: number;
    order: number;
    arrSideEffect: ((state: any) => void)[];
};

export class StateRoot<TState extends TStateBase> implements IStateRoot<TState>{
    states: TState;
    stateVersion: number;
    nextStateVersion: number;
    arrTransformationDefinition: (TransformationDefinition<TState>)[];
    mapStateDefinition: Map<keyof (TState), TStateDefinition<TState>>;
    arrProcessState: (TProcessState<TState>)[];
    mapProcessState: Map<keyof (TState), TProcessState<TState>>;
    mapAction: Map<string, ActionHandler<any, TState, any>>
    handleActionLevel: number;

    constructor(initialState?: TState) {
        this.states = initialState ?? ({} as TState)
        this.stateVersion = 1;
        this.nextStateVersion = 2;
        this.arrTransformationDefinition = [];
        this.mapStateDefinition = new Map();
        this.arrProcessState = [];
        this.mapProcessState = new Map();
        this.mapAction = new Map();
        this.handleActionLevel = 0;

        if ((initialState !== undefined) && (typeof initialState === "object")) {
            for (const key in initialState) {
                if (Object.prototype.hasOwnProperty.call(initialState, key)) {
                    this.getStateDefinition(key);
                    this.getProcessState(key);
                }
            }
        }
    }

    addTransformation(
        transformationName: string,
        sourceNames: (keyof (TState))[],
        targetNames: (keyof (TState))[],
        transformator: Transformator<TState>
    ) {
        let transformationDefinition: TransformationDefinition<TState> = {
            transformationName: transformationName,
            sourceNames: sourceNames,
            targetNames: targetNames,
            transformator: transformator
        };
        this.arrTransformationDefinition.push(transformationDefinition);
        //
        let stateOrderSources = sourceNames.map((sourceName) => this.getStateDefinition(sourceName));
        let stateOrderTargets = targetNames.map((targetName) => this.getStateDefinition(targetName));
        stateOrderSources.forEach((stateOrderSource) => {
            stateOrderTargets.forEach(
                (stateOrderTarget) => {
                    stateOrderSource.succ.set(stateOrderTarget.key, stateOrderTarget);
                    if (stateOrderTarget.level <= stateOrderSource.level) {
                        stateOrderTarget.level = stateOrderSource.level + 1;
                    }
                }
            );
        });
        stateOrderTargets.forEach((stateOrderTarget) => {
            stateOrderSources.forEach(
                (transformatorOrderSource) => {
                    stateOrderTarget.prev.set(transformatorOrderSource.key, transformatorOrderSource);
                    if (stateOrderTarget.level <= transformatorOrderSource.level) {
                        stateOrderTarget.level = transformatorOrderSource.level + 1;
                    }
                }
            );
        });
    }

    addSideEffect<TKey extends keyof (TState)>(key: TKey, sideEffect: (state: TState[TKey]) => void) {
        const stateDefinition = this.getStateDefinition(key);
        stateDefinition.arrSideEffect.push(sideEffect);
    }

    getStateDefinition(key: keyof (TState)): TStateDefinition<TState> {
        let transformatorOrder = this.mapStateDefinition.get(key);
        if (transformatorOrder === undefined) {
            transformatorOrder = {
                key: key as string,
                prev: new Map(),
                succ: new Map(),
                level: 0,
                order: this.mapStateDefinition.size,
                arrSideEffect: []
            };
            this.mapStateDefinition.set(key, transformatorOrder);
        }
        return transformatorOrder;
    }

    getProcessState(key: keyof (TState)): TProcessState<TState> {
        let activeState = this.mapProcessState.get(key);
        if (activeState === undefined) {
            activeState = {
                stateName: key,
                mapSuccDirty: new Map(),
                isDirty: true,
                stateVersion: 1,
                arrTransformator: [],
                arrSideEffect: []
            };
            this.mapProcessState.set(key, activeState);
        }
        return activeState;
    }

    buildTransformatorOrder() {
        const arrStateOrder: (TStateDefinition<TState>)[] = [];
        let arrWorkingStateDefinition = Array.from(this.mapStateDefinition.values());
        for (let level = 0; (level <= this.mapStateDefinition.size) && (arrWorkingStateDefinition.length > 0); level++) {
            for (const stateOrder of arrWorkingStateDefinition) {
                for (const succStateOrder of stateOrder.succ.values()) {
                    if (succStateOrder.level <= stateOrder.level) {
                        succStateOrder.level = stateOrder.level + 1;
                    }
                }
            }
            const arrStateDefinitionAtLevel = arrWorkingStateDefinition.filter((stateDefinition) => stateDefinition.level <= level).sort((a, b) => (a.order - b.order));
            arrStateOrder.push(...arrStateDefinitionAtLevel);
            arrWorkingStateDefinition = arrWorkingStateDefinition.filter((stateDefinition) => stateDefinition.level > level);
        }
        this.arrProcessState = arrStateOrder.map((stateOrder) => {
            // const key = stateOrder.key;
            const processState = this.getProcessState(stateOrder.key);
            processState.arrTransformator = this.arrTransformationDefinition.filter((transformationDefinition) => transformationDefinition.targetNames.indexOf(processState.stateName) >= 0);
            processState.arrSideEffect = stateOrder.arrSideEffect;
            if ((processState.arrTransformator.length === 0) && (processState.arrSideEffect.length === 0)) {
                processState.isDirty = false;
            } else {
                processState.isDirty = true;
            }
            return { stateOrder, activeState: processState };
        }).map(({ stateOrder, activeState }) => {
            for (const succkey of stateOrder.succ.keys()) {
                const succProcessState = this.getProcessState(succkey);
                if ((succProcessState.arrTransformator.length > 0) || (succProcessState.arrSideEffect.length > 0)) {
                    activeState.mapSuccDirty.set(succkey, succProcessState);
                }
            }
            return activeState;
        });
    }

    process() {
        if ((this.stateVersion === 1) && (this.arrProcessState.length == 0)) {
            this.buildTransformatorOrder();
        }
        this.stateVersion = this.nextStateVersion;
        this.nextStateVersion = this.stateVersion + 1;
        const stateTransformator: IStateTransformator<TState> = new StateTransformator(this);
        const arrDirtyProcessStateWithSideEffect: (TProcessState<TState>)[] = [];
        for (const processState of this.arrProcessState) {
            if (processState.isDirty) {
                if (processState.arrTransformator.length > 0) {
                    for (const transformator of processState.arrTransformator) {
                        try {
                            transformator.transformator(stateTransformator, this.states);
                        } catch (error) {
                            console.error("Error", transformator.transformationName, error);
                        }
                    }
                    if (processState.isDirty) {
                        processState.isDirty = false;
                        console.warn("Warning: still dirty after processing transformators", processState.stateName, processState.arrTransformator.map((t) => t.transformationName));
                    }
                } else {
                    processState.isDirty = false;
                }
                if (processState.arrSideEffect.length > 0) {
                    arrDirtyProcessStateWithSideEffect.push(processState);
                }
            }
        }
        for (const processState of this.arrProcessState) {
            if (processState.isDirty) {
                console.warn("Warning: is dirty after processing all states", processState.stateName);
            }
        }
        for (const processState of arrDirtyProcessStateWithSideEffect) {
            const state = this.states[processState.stateName];
            for (const sideEffect of processState.arrSideEffect) {
                sideEffect(state);
            }
        }
    }

    processOneState(key: keyof (TState)) {
        throw new Error("TODO");
    }

    clearDirtyFromTransformator(key: keyof (TState)) {
        const processState = this.getProcessState(key);
        processState.isDirty = false;
    }

    setStateFromTransformator<TKey extends keyof (TState)>(key: TKey, newState: TState[TKey]) {
        const processState = this.getProcessState(key);
        const currentState = this.states[key];
        if (typeof currentState === "undefined") {
            console.error("setActiveStateVersion no such sub-state", key);
        }
        if (typeof newState === "object" && typeof currentState === "object") {
            if (typeof (currentState as any).stateVersion === "number") {
                (newState as any).stateVersion = this.stateVersion;
            }
        }
        this.states[key] = newState;
        processState.stateVersion = this.stateVersion;
        processState.isDirty = false;
        for (const succActiveState of processState.mapSuccDirty.values()) {
            succActiveState.isDirty = true;
        }
    }

    addAction<TPayload, TResult extends Promise<any | void> | void>(
        actionType: string,
        actionHandler: ActionHandler<TPayload, TState, TResult>
    ): ActionInvoker<TPayload, TResult> {
        if (this.mapAction.has(actionType)){
            throw new Error(`Action with actionType ${actionType} has been already added.`);
        }
        this.mapAction.set(actionType, actionHandler);
        const actionInvoker = (payload: TPayload) => {
            return this.handleAction(actionType, payload);
        }
        return actionInvoker;
    }

    handleAction<TPayload, TResult extends Promise<void> | void = any>(actionType: string, payload: TPayload): TResult {
        this.handleActionLevel++;
        let added = true;
        try {
            const result = this.executeAction(actionType, payload);
            if (result !== undefined && typeof result.then === "function") {
                //result.then(()=>{},()=>{}).finally(()=>{
                const pResult = result.finally(() => {
                    try {
                        this.process();
                    } finally {
                        if (added) { added = false; this.handleActionLevel--; }
                    }
                });
                return pResult as any;
            } else {
                this.process();
                if (added) { added = false; this.handleActionLevel--; }
                return undefined!;
            }
        } catch (error){
            if (added) { added = false; this.handleActionLevel--; }
            throw (error);
        }
    }

    executeAction<TPayload>(actionType: string, payload: TPayload): void | Promise<void> {
        const actionHandler = this.mapAction.get(actionType) as (ActionHandler<TPayload, TState, Promise<any | void> | void> | undefined);
        if (actionHandler === undefined) {
            throw new Error(`actionType: ${actionType} is unknown`);
        } else {
            const actionResult = actionHandler(payload, this);
            if (actionResult && typeof actionResult.then === "function") {
                return actionResult;
            } else {
                return;
            }
        }
    }
    setStateFromAction<TKey extends keyof (TState)>(key: TKey, newState: TState[TKey]): void {
        const processState = this.getProcessState(key);
        const currentState = this.states[key];
        if (typeof currentState === "undefined") {
            console.error("setStateFromAction no such sub-state", key);
        }
        if (processState.stateVersion !== this.nextStateVersion) {
            if (typeof newState === "object" && typeof currentState === "object") {
                if (typeof (currentState as any).stateVersion === "number") {
                    (newState as any).stateVersion = this.nextStateVersion;
                }
            }
            this.states[key] = newState;
            processState.stateVersion = this.nextStateVersion;
            // if (processState.transformators.length>0){
            //     processState.isDirty = true;
            // }
            for (const succActiveState of processState.mapSuccDirty.values()) {
                succActiveState.isDirty = true;
            }
        }
    }

    setStateHasChanged(key: keyof (TState), hasChanged: boolean): void {
        if (hasChanged) {
            this.setStateDirty(key);
        }
    }

    setStateDirty(key: keyof (TState)) {
        const processState = this.mapProcessState.get(key);
        if (processState === undefined) {
            return;
        } else {
            if (processState.isDirty) {
                // skip
            } else {
                const currentState = this.states[key];
                if (processState.stateVersion !== this.nextStateVersion) {
                    if (typeof (currentState as any).stateVersion === "number") {
                        (currentState as any).stateVersion = this.nextStateVersion;
                    }
                    processState.stateVersion = this.nextStateVersion;
                    // if (processState.transformators.length>0){
                    //     processState.isDirty = true;
                    // }
                    for (const succActiveState of processState.mapSuccDirty.values()) {
                        succActiveState.isDirty = true;
                    }
                }
            }
        }
    }
}