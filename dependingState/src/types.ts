import type React from 'react';
import type { DSUIStateValue } from './DSUIStateValue';

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export interface IDSStoreManager {
    /**
     * gets the (global) next stateVersion. within procsess() this value will be increased.
     * @param stateVersion 
     */
    getNextStateVersion(stateVersion: number): number;

    /**
     * attach the store to the storeManager. The order of the attachs defines the order of store.processDirty is called.
     * @param valueStore the store to attach
     * @returns this
     */
    attach(valueStore: IDSValueStoreBase): this;

    /**
     * get the store by the storename.
     * @param storeName the name of the store
     * @returns the store or undefined if not found.
     */
    getValueStore(storeName: string): (IDSValueStoreBase | undefined)
    
    /**
     * initialize the storeManager and stores. Call this after you call forall stores storeManager.attach;
     * initialize invoke postAttach in all stores.
     * @returns this
     */
    initialize(): void;

    resetRegisteredEvents(): void;
    // updateRegisteredEvents(): void;

    emitUIUpdate(uiStateValue: IDSUIStateValue): void;
    emitEvent(event: DSEvent): DSEventHandlerResult;

    process(msg?: string, fn?: () => DSEventHandlerResult): DSEventHandlerResult;

    processUIUpdates(): void;

    isDirty: boolean;
}
export interface IDSStoreManagerInternal extends IDSStoreManager {
    isProcessing: number;
    isupdateRegisteredEventsDone: boolean;
}

export type ValueStoreInternal = {
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler }[]>;
    arrEmitDirtyHandler: { msg: string, handler: DSEmitDirtyHandler<any> }[];
    arrEmitDirtyRelated: { msg: string, valueStore: IDSAnyValueStore }[] | undefined;
    setEffectiveEvents: Set<string> | undefined;
} & IDSAnyValueStore;


export interface IDSStoreBuilder<StoreName extends string = string> {
    createAction<
        Payload,
        EventType extends string = string
    >(
        event: EventType
    ): IDSStoreAction<Payload, EventType, StoreName>;

    bindValueStore(valueStore: IDSAnyValueStore): void;
}

export interface IDSStoreAction<
    Payload,
    EventType extends string = string,
    StoreName extends string = string
    > {
    bindValueStore(valueStore: IDSAnyValueStore): void;

    listenEvent<
        Event extends DSEvent<Payload, EventType, StoreName>
    >(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten;

    emitEvent(payload: Payload): DSEventHandlerResult;
}

export interface IDSValueStoreBase {
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    listenToAnyStore: boolean;
    isDirty: boolean;

    /**
     * call form storeManager.initialize()
     * @param storeManager 
     */
    initializeStore(storeManager: IDSStoreManager): void;
    initializeBoot():void;

    getNextStateVersion(stateVersion: number): number;
}

export type ThenPromise = (p:Promise<any|void>) => Promise<any|void> | void;

export interface IDSValueStore<
    Key,
    Value = any,
    StoreName extends string = string
    > extends IDSValueStoreBase {
    storeName: StoreName;

    getEntities(): { key: Key, stateValue: IDSStateValue<Value> }[];

    setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void;

    emitDirtyFromValueChanged(stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void;
    emitDirty(stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void;
    listenEmitDirty(msg: string, callback: DSEmitDirtyHandler<Value>): DSUnlisten;
    unlistenEmitDirty(callback: DSEmitDirtyHandler<Value>): void;
    listenDirtyRelated(msg: string, relatedValueStore: IDSValueStoreBase): DSUnlisten;
    unlistenDirtyRelated(relatedValueStore: IDSValueStoreBase): void;

    processDirty(): void;

    emitUIUpdate(uiStateValue: IDSUIStateValue<Value>): void;

    /**
     * emit the event.
     * @param eventType the event
     * @param payload  the payload
     * @param thenPromise ignore for now
     */
    emitEvent<
        Event extends DSEvent<Payload, EventType, StoreName>,
        Payload = Event['payload'],
        EventType extends string = Event['event'],
        >(
            eventType: Event['event'],
            payload: Event['payload'],
            thenPromise?: ThenPromise | undefined
        ): DSEventHandlerResult;

    listenEvent<
        Event extends DSEvent<Payload, string, StoreName>,
        Payload = Event['payload']
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], Event['storeName']>): DSUnlisten;

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

export type IDSAnyValueStore = IDSValueStore<any, any, string>;

export interface IDSObjectStore<
    Value = any,
    StoreName extends string = string
    > extends IDSValueStore<"stateValue", Value, StoreName> {
    stateValue: IDSStateValue<Value>;

    listenEventValue(msg: string, callback: DSEventEntityVSValueHandler<Value, StoreName>): DSUnlisten;
}

export type ConfigurationDSValueStore<Value> = {
    initializeStore?: () => void;
}

export interface IDSArrayStore<
    Key = number,
    Value = any,
    StoreName extends string = string
    > extends IDSValueStore<Key, Value, StoreName> {
    attach(stateValue: IDSStateValue<Value>): void;
    detach(stateValue: IDSStateValue<Value>): void;
    //listenEventValue(msg: string, callback: DSEventValueHandler<IDSStateValue<Value>, StoreName, Value>): DSUnlisten;
}
export type ConfigurationDSArrayValueStore<Value> = ConfigurationDSValueStore<Value> & {
    create?: ((value: Value) => IDSStateValue<Value>);
}

export interface IDSMapStore<
    Key = string,
    Value = any,
    StoreName extends string = string
    > {

}

export type ConfigurationDSMapValueStore<
    Value = any
    > = ConfigurationDSValueStore<Value> & {
        create?: ((value: Value) => IDSStateValue<Value>);
    }

export type ConfigurationDSEntityValueStore<
    Key = string,
    Value = any,
    > = ConfigurationDSValueStore<Value> & {
        create?: (value: Value) => IDSStateValue<Value>;
        getKey: (value: Value) => Key;
    }

export interface IDSStateValue<Value> {
    isDirty: boolean;
    store: IDSValueStoreWithValue<Value> | undefined;
    stateVersion: number;
    value: Value;
    valueChanged(properties?: Set<keyof Value> | undefined): void;
    getUIStateValue(): DSUIStateValue<Value>;
    setStore(store: IDSValueStoreWithValue<Value>): boolean;

    getViewProps(): DSUIProps<Value>;
    emitUIUpdate(): void;
    triggerUIUpdate(): void;
    triggerScheduled: boolean;
}

export type IDSValueStoreWithValue<Value> = IDSValueStore<any, Value, string>

export interface IDSPropertiesChanged<
    Value = any
    // = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>)
    > {
    add(key: keyof Value): void;

    setIf<K extends keyof Value>(
        key: K,
        value: Value[K],
        fnIsEqual?: (o: Value[K], n: Value[K]) => boolean
    ): boolean;

    get hasChanged(): boolean;

    giveBack(): void;

    valueChangedIfNeeded(): boolean;
}

export interface IDSUIStateValue<Value = any> {
    getViewProps(): DSUIProps<Value>;
    triggerUIUpdate(): void;
    triggerScheduled: boolean;
}

// export type WrappedDSStateValue<Entity> = (Entity extends IDSStateValue<infer Value> ? (Value extends IDSStateValue<Value> ? Value : Entity) : (IDSStateValue<Entity>));

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
    {
        storeName: StoreName;
        event: EventType;
        payload: Payload;
        thenPromise?: ThenPromise | undefined
    };

export type DSPayloadEntitySV<
    Value = any,
    Key extends (any | never) = never,
    Index extends (number | never) = never> = ({
        entity: IDSStateValue<Value>;
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

export type DSEventEntityVSAttach<
    Value = any,
    Key extends any | never = never,
    Index extends number | never = never,
    StoreName extends string = string
    > = DSEvent<DSPayloadEntitySV<Value, Key, Index>, "attach", StoreName>;

export type DSEventEntitySVDetach<
    Value = any,
    Key extends any | never = never,
    Index extends number | never = never,
    StoreName extends string = string
    > = DSEvent<DSPayloadEntitySV<Value, Key, Index>, "detach", StoreName>;

export type DSPayloadEntitySVValue<
    Value
    > = ({
        entity: IDSStateValue<Value>;
        properties?: Set<keyof Value> | undefined
    });

export type DSEventEntityVSValue<
    Value = any,
    StoreName extends string = string
    > = DSEvent<DSPayloadEntitySVValue<Value>, "value", StoreName>;

export type DSEmitDirtyHandler<Value> = (stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>) => void;

export type DSEventHandlerResult = (Promise<any | void> | void);
export type DSManyEventHandlerResult = (Promise<any | void>[] | undefined);

export type DSEventHandler<
    Payload = any,
    EventType extends string = string,
    StoreName extends string = string
    > = (event: DSEvent<Payload, EventType, StoreName>) => DSEventHandlerResult;

export type DSEventEntityVSValueHandler<
    Value,
    StoreName extends string
    > = (event: DSEvent<DSPayloadEntitySVValue<Value>, "value", StoreName>) => DSEventHandlerResult;


export type DSUnlisten = (() => void);

export type DSUIViewState<T = any> = T & DSUIViewStateBase;

export type DSUIViewStateBase = {
    stateVersion: number;
};

export type DSUIProps<Value = any> = {
    getRenderProps: () => Value;
    wireStateVersion<Props extends DSUIProps<Value> = any, State extends DSUIViewStateBase = any>(component: React.Component<Props, State>): void;
    unwireStateVersion<Props extends DSUIProps<Value> = any, State extends DSUIViewStateBase = any>(component: React.Component<Props, State>): void;
    getStateVersion(): number;
} & {
    key?: string | number;
};
