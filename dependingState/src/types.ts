import type React from 'react';
import { DSStoreManager } from '.';
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
    initialize(fnInitializeStore?: () => void, fnBoot?: () => void): this;

    resetRegisteredEvents(): void;
    // updateRegisteredEvents(): void;

    emitUIUpdate(uiStateValue: IDSUIStateValue): void;
    emitEvent(event: DSEvent): DSEventHandlerResult;

    process(msg?: string, fn?: () => DSEventHandlerResult): DSEventHandlerResult;

    // processUIUpdates(): void;

    isDirty: boolean;
}
export interface IDSStoreManagerInternal extends IDSStoreManager {
    storeManagerState: number;
    isProcessing: number;
    isupdateRegisteredEventsDone: boolean;
    warnUnlistenEvents: boolean;
    warnEventsOutOfProcess: boolean;
}

export interface IDSStoreBuilder<StoreName extends string = string> {
    createAction<
        Payload,
        EventType extends string = string
    >(
        event: EventType
    ): IDSStoreAction<Payload, EventType, StoreName>;

    bindValueStore(valueStore: IDSValueStoreBase): void;
}

export interface IDSStoreAction<
    Payload,
    EventType extends string = string,
    StoreName extends string = string
    > {
    bindValueStore(valueStore: IDSValueStoreBase): void;

    listenEvent<
        Event extends DSEvent<Payload, EventType, StoreName>
    >(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten;

    emitEvent(payload: Payload): DSEventHandlerResult;
}

export interface IDSValueStoreBase {
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    get isDirty(): boolean;

    /**
     * call form storeManager.initialize()
     * @param storeManager 
     */
    initializeStore(storeManager: IDSStoreManager): void;
    initializeBoot(): void;

    getNextStateVersion(stateVersion: number): number;
}

export interface IDSValueStore<
    Key,
    Value = any,
    StoreName extends string = string
    > extends IDSValueStoreBase {
    storeName: StoreName;

    get isDirty(): boolean;

    /**
     * binds the events/actions from the storeBuilder to this valueStore 
     * @param storeBuilder the storeBuilder to bind
     */
    setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void;

    /**
     * gets all entities
     */
    getEntities(): { key: Key, stateValue: IDSStateValue<Value> }[];

    /**
     * emit the event by enqueue it within the DSStoreManager that will be handled in process() (that should already running)
     * @param eventType the event
     * @param payload  the payload
     */
    emitEvent<
        Event extends DSEvent<Payload, EventType, StoreName>,
        Payload = Event['payload'],
        EventType extends string = Event['event'],
        >(
            eventType: Event['event'],
            payload: Event['payload'],
    ): DSEventHandlerResult;

    /**
     * register a callback for events that will be enqueued with emitEvent and invoked from process().
     * @param msg a log message that will be logged before the callback will be invoked.
     * @param event the current event name
     * @param callback the callback that will be invoked.
     */
    listenEvent<
        Event extends DSEvent<Payload, string, StoreName>,
        Payload = Event['payload']
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], Event['storeName']>): DSUnlisten;

    /**
     * unregister the callback.
     * @param event the current event name
     * @param callback the callback that will be removed.
     */
    unlistenEvent<
        Event extends DSEvent<any, string, StoreName>
    >(event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): void;

    /**
     * should be called after a value change - or willbe called from DSPropertiesChanged.valueChangedIfNeeded().
     * calls all callbacks - registed with listenDirtyValue - which can call setDirty if a relevant property was changed.
     * @param msg the message is used for setDirty
     * @param stateValue the entity that changed
     * @param properties the properties that changed
     */
    emitValueChanged(msg: string, stateValue: IDSStateValue<Value>, properties?: Set<keyof Value>): void;

    /**
     * register a callback that is called from emitDirtyValue.
     * @param msg the log message is logged before the callback is invoked.
     * @param callback the callback that will be called
     */
    listenValueChanged(msg: string, callback: DSEmitValueChangedHandler<Value>): DSUnlisten;

    /**
    * unregister the callback
    * @param callback the callback to unregister
    */
    unlistenValueChanged(callback: DSEmitValueChangedHandler<Value>): void;

    /**
     * set the isDirty flag and DSStoreManager.process will call processDirty
     * @param msg the message is logged if the store was not dirty
     */
    setDirty(msg: string): void

    /**
     *  DSStoreManager.process call this if setDirty was called before
     *  @returns true then emitCleanUp will be called
     */
    processDirty(): boolean;

    /**
     * would be called if processDirty returns true
     */
    emitCleanedUp(): void;

    /**
     * if this store gets cleanedup (processDirty returns true) the relatedValueStore gets dirty.
     * @param msg 
     * @param relatedValueStore 
     */
    listenCleanedUpRelated(msg: string, relatedValueStore: IDSValueStoreBase): DSUnlisten;

    /**
     * unregister the relatedValueStore
     * @param relatedValueStore 
     */
    unlistenCleanedUpRelated(relatedValueStore: IDSValueStoreBase): void;

    /**
     * register a callback that is (directly) invoked by emitDirty
     * @param msg 
     * @param callback 
     */
    listenCleanedUp(msg: string, callback: DSEmitCleanedUpHandler<Value>): DSUnlisten;

    /**
     * unregister a callback
     * @param callback 
     */
    unlistenCleanedUp(callback: DSEmitCleanedUpHandler<Value>): void;

    /**
     * enqueue the uiStateValue to be updated (within DSStoreManager.process - that should already running)
     * @param uiStateValue 
     */
    emitUIUpdate(uiStateValue: IDSUIStateValue<Value>): void;
}

export interface IDSValueStoreInternals<Value> {
    isProcessDirtyConfigured: boolean;
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler<any, string, string> }[]>;
    arrValueChangedHandler: ({ msg: string, handler: DSEmitValueChangedHandler<Value> }[]) | undefined;
    arrCleanedUpRelated: ({ msg: string, valueStore: IDSValueStoreBase }[]) | undefined;
    arrCleanedUpHandler: ({ msg: string, handler: DSEmitCleanedUpHandler<IDSValueStoreBase> }[]) | undefined;


    /**
     * call all listenDirtyValue, listenCleanedUp, listenCleanedUpRelated and listenEvent.
     */
    initializeStore(storeManager: DSStoreManager): void;

    /**
     * called after initializeStore
     */
    initializeRegisteredEvents(): void;

    /**
     * called after initializeRegisteredEvents
     */
    validateRegisteredEvents(): void;

    /**
     * called after initializeStore
     */
    initializeBoot(): void;

    /**
     * returns if any eventhandler is registered for this event
     * @param event the eventname
     */
    hasEventHandlersFor(event: string): boolean;

    /**
     * internal
     * @param event 
     */
    processEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>): DSEventHandlerResult;

    /**
     * called after processDirty()
     * @param processDirtyResult result of processDirty
     */
    postProcessDirty(processDirtyResult: boolean): void;
}
export type IDSAnyValueStore = IDSValueStore<any, any, string>;

export type IDSAnyValueStoreInternal = IDSValueStore<any, any, string> & IDSValueStoreInternals<any>;



export interface IDSObjectStore<
    Value = any,
    StoreName extends string = string
    > extends IDSValueStore<"stateValue", Value, StoreName> {
    stateValue: IDSStateValue<Value>;

    listenEventValue(msg: string, callback: DSEventEntityVSValueHandler<Value, StoreName>): DSUnlisten;
}

export type ConfigurationDSValueStore<Value> = {
    initializeStore?: () => void;
    initializeBoot?: () => void;
    processDirty?: () => boolean;
}

export type ConfigurationDSLooseValueStore<Value> = ConfigurationDSValueStore<Value> & {
    // processDirtyEntity?: (dirtyEntity: IDSStateValue<Value>, properties?: Set<keyof Value>) => boolean;
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
    // processDirtyEntity?: (dirtyEntity: IDSStateValue<Value>, properties?: Set<keyof Value>) => boolean;
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
        // processDirtyEntity?: (dirtyEntity: IDSStateValue<Value>, properties?: Set<keyof Value>) => boolean;
    }

export type ConfigurationDSEntityValueStore<
    Key = string,
    Value = any,
    > = ConfigurationDSValueStore<Value> & {
        create?: (value: Value) => IDSStateValue<Value>;
        getKey: (value: Value) => Key;
    }

export interface IDSStateValue<Value> {
    store: IDSValueStoreWithValue<Value> | undefined;
    stateVersion: number;
    value: Value;
    valueChanged(msg: string, properties?: Set<keyof Value> | undefined): void;
    getUIStateValue(): DSUIStateValue<Value>;
    setStore(store: IDSValueStoreWithValue<Value>): boolean;

    getViewProps(): DSUIProps<Value>;

    triggerScheduled: boolean;
    emitUIUpdate(): void;
    triggerUIUpdate(stateVersion: number): void;
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

    valueChangedIfNeeded(msg: string): boolean;
}

export interface IDSUIStateValue<Value = any> {
    getViewProps(): DSUIProps<Value>;
    triggerUIUpdate(stateVersion: number): void;
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

export type DSEmitCleanedUpHandler<Value> = (store: Value) => void;
export type DSEmitValueChangedHandler<Value> = (stateValue: IDSStateValue<Value>, properties?: Set<keyof Value>) => void;

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

export type DSComponentStateVersionName = { component: React.Component<any>; stateVersionName: string; };

export type DSUIProps<Value = any> = {
    getRenderProps: () => Value;
    wireStateVersion<Props extends DSUIProps<Value> = any, State extends DSUIViewStateBase = any>(
        component: React.Component<Props, State>,
        stateVersionName?: string|undefined
    ): number;
    unwireStateVersion<Props extends DSUIProps<Value> = any, State extends DSUIViewStateBase = any>(
        component: React.Component<Props, State>
    ): void;
    getStateVersion(): number;
} & {
    key?: string | number;
};

/*
type Xxx1<y extends string>={
    [key in y]:number;
}
type Xxx<y extends string|undefined>={
    [key in (y extends string ? y : "stateVersion")]:number;
}
const abc1:Xxx<"aaa">={
    aaa:1
};
const abc2:Xxx<undefined>={
    stateVersion:1
};
*/

export type DSLogFlag = (
    "emitValueChanged"
    | "triggerUIUpdate"
    | "valueChangedIfNeeded"
);