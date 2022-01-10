import type React from 'react';
import type { DSUIStateValue } from './DSUIStateValue';

export interface IDSStoreManager {
    nextStateVersion: number;
    valueStores: IDSValueStore[];
    events: DSEvent[];
    isProcessing: number;
    arrUIStateValue: IDSUIStateValue[];
    lastPromise: Promise<any | void> | undefined;

    getNextStateVersion(stateVersion: number): number;
    attach(valueStore: IDSValueStore): this;
}

export interface IDSValueStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = IDSStateValue<Value>
    > {
    storeName: string;
    storeManager: IDSStoreManager | undefined;
    mapEventHandlers: Map<string, DSEventHandler[]>;
    arrDirtyHandler: DSDirtyHandler<Value>[];
    isDirty: boolean;

    getNextStateVersion(stateVersion: number): number;

    emitDirty(stateValue: StateValue): void;
    listenDirty(callback: DSDirtyHandler<Value>): DSUnlisten;
    unlistenDirty(callback: DSDirtyHandler<Value>): void;
    processDirty(): boolean;

    emitUIUpdate(uiStateValue: DSUIStateValue<Value>): void;

    emitEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>): DSEventHandlerResult;

    listenEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten;

    unlistenEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): void;

    processEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>): DSEventHandlerResult;
}

export interface IDSStateValue<Value = any> {
    isDirty: boolean;
    store: IDSValueStore<Value> | undefined;
    stateVersion: number;
    uiStateValue: DSUIStateValue<Value> | undefined;
    value: Value;
    valueChanged(): void;
    getUIStateValue(): DSUIStateValue<Value>;
}

export interface IDSUIStateValue<Value = any> {
    getViewProps(): DSUIProps<Value>;
    triggerUIUpdate(): void;
    triggerScheduled: boolean;
}

export type WrappedDSStateValue<Entity> = Entity extends IDSStateValue<infer T> ? Entity : IDSStateValue<Entity>;
// export type WrappedDSStateValue2<Entity> = Entity extends (DSStateValue<infer T>) ? Entity : DSStateValue<Entity>;

// export type  x1=WrappedDSStateValue2<boolean>;
// export type  x2=WrappedDSStateValue2<DSStateValue<boolean>>;

export type DSEventName<
    EventType extends string = string,
    StoreName extends string = string
    > = {
        storeName: StoreName;
        event: EventType;
    };


export type DSEvent<
    Payload = any,
    EventType extends string = string,
    StoreName extends string = string
    > =
    DSEventName<EventType, StoreName> &
    (
        Payload extends never
        ? {}
        : {
            payload: Payload;
        }
    );

export type DSPayloadEntity<
    Entity = any,
    Key extends (any | never) = never,
    Index extends (number | never) = never> = ({
        entity: Entity;
    }) & ([Key] extends [never]
        ? {
            key?: any;
        }
        : {
            key: Key;
        }
    )
    & ([Index] extends [never]
        ? {
            index?: number;
        }
        : {
            index: number;
        }
    )
    ;

export type DSEventAttach<
    Entity = any,
    Key extends any | never = never,
    Index extends number | never = never
    > = DSEvent<DSPayloadEntity<Entity>, "attach">;

export type DSEventDetach<
    Entity = any,
    Key extends any | never = never,
    Index extends number | never = never
    > = DSEvent<DSPayloadEntity<Entity>, "detach">;

export type DSEventValue<
    Entity = any,
    Key extends any | never = never,
    Index extends number | never = never
    > = DSEvent<DSPayloadEntity<Entity>, "value">;

export type DSDirtyHandler<Value = any> = (stateValue: IDSStateValue<Value>) => void;
export type DSEventHandlerResult = (Promise<any | void> | void);
export type DSEventHandler<
    Payload = any,
    EventType extends string = string,
    StoreName extends string = string
    > = (event: DSEvent<Payload, EventType, StoreName>) => DSEventHandlerResult;
export type DSUnlisten = (() => void);

export type DSUIViewState<T = any> = T & DSUIViewStateBase;

export type DSUIViewStateBase = {
    stateVersion: number;
};

export type DSUIProps<Value = any> = {
    getViewProps: () => Value;
    wireStateVersion<Props extends DSUIProps<Value> = any, State extends DSUIViewStateBase = any>(component: React.Component<Props, State>): void;
    unwireStateVersion<Props extends DSUIProps<Value> = any, State extends DSUIViewStateBase = any>(component: React.Component<Props, State>): void;
    getStateVersion(): number;
} & {
    key?: string | number;
};


/*
export type DSEventName<EventType extends string = string> = {
    event: EventType;
};

export type DSEventNameStore<EventType extends string = string, StoreName extends string = string> = {
    event: EventType;
    storeName: StoreName;
};

export type DSEventNameType<EventType extends string = string, StoreName extends string | never = never>
    = DSEventName<EventType>
    | DSEventNameStore<EventType, StoreName>
    ;

export type DSEvent<Payload = any, EventType extends string = string, StoreName extends string | never = never> =
    DSEventNameStore<EventType, StoreName> &
    (
        Payload extends never
        ? {}
        : {
            payload: Payload;
        }
    );

export type DSEventType<Payload = any, EventType extends string = string, StoreName extends string | never = never> =
    DSEventNameType<EventType, StoreName> &
    (
        Payload extends never
        ? {}
        : {
            payload: Payload;
        }
    );

export type DSPayloadEntity<
    Entity = any,
    Key extends any | never = never,
    Index extends number | never = never> = (
        [Entity] extends [DSStateValue<Entity>]
        ? {
            entity: Entity;
        } : {
            entity: DSStateValue<Entity>;
        })
    & ([Key] extends [never]
        ? {}
        : {
            key: Key;
        }
    )
    & ([Index] extends [never]
        ? {}
        : {
            index: number;
        }
    )
    ;

export type DSEventAttach<Entity = any, Key extends any | never = never, Index extends number | never = never> = DSEvent<DSPayloadEntity<Entity>, "attach">;
export type DSEventDetach<Entity = any, Key extends any | never = never, Index extends number | never = never> = DSEvent<DSPayloadEntity<Entity>, "detach">;
export type DSEventValue<Entity = any, Key extends any | never = never, Index extends number | never = never> = DSEvent<DSPayloadEntity<Entity>, "value">;

export type DSDirtyHandler<Value = any> = (stateValue: DSStateValue<Value>) => void;
export type DSEventHandlerResult = (Promise<any | void> | void);
export type DSEventHandler<Payload = any, EventType extends string = string> = (event: DSEvent<Payload, EventType>) => DSEventHandlerResult;
export type DSEventHandlerByEvent<Event extends DSEvent> = (event: Event) => DSEventHandlerResult;

export type DSUnlisten = (() => void);

export type DSUIViewState<T = any> = T & DSUIViewStateBase;


*/