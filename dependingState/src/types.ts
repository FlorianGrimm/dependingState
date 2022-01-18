import type React from 'react';
import type { DSUIStateValue } from './DSUIStateValue';

export type ArrayElement<T> = T extends (infer U)[]?U:never;

export interface IDSStoreManager {
    getNextStateVersion(stateVersion: number): number;

    attach(valueStore: IDSValueStoreBase): this;
    getValueStore(storeName: string): (IDSValueStoreBase | undefined)
    postAttached(): void;
    updateRegisteredEvents(): void;
    resetRegisteredEvents(): void;

    emitUIUpdate(uiStateValue: IDSUIStateValue): void;
    emitEvent(event: DSEvent): DSEventHandlerResult;
    process(msg?: string, fn?: () => DSEventHandlerResult): DSEventHandlerResult;

    processUIUpdates(): void;
}

export type ValueStoreInternal = {
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler }[]>;
    arrEmitDirtyHandler: { msg: string, handler: DSEmitDirtyHandler<any, any> }[];
    arrEmitDirtyRelated: { msg: string, valueStore: IDSValueStore<any, any, any, string> }[] | undefined;
    setEffectiveEvents: Set<string> | undefined;
} & IDSValueStore<any, any, any, string>;


export interface IDSStoreBuilder<StoreName extends string = string> {
    createAction<
        Payload,
        EventType extends string = string
    >(
        event: EventType
    ): IDSStoreAction<Payload, EventType, StoreName>;

    bindValueStore(valueStore: IDSValueStore<any, any, any, StoreName>): void;
}

export interface IDSStoreAction<
    Payload,
    EventType extends string = string,
    StoreName extends string = string
    > {
    bindValueStore(valueStore: IDSValueStore<any, any, any, StoreName>): void;

    listenEvent<
        Event extends DSEvent<Payload, EventType, StoreName>
    >(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten;

    /*
    listenEventAnyStore<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(msg: string, event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten;
    */
   emitEvent(payload: Payload): DSEventHandlerResult;

 
}
export interface IDSValueStoreBase {
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    listenToAnyStore: boolean;
    isDirty: boolean;

    postAttached(storeManager: IDSStoreManager): void;
    getNextStateVersion(stateVersion: number): number;

}
export interface IDSValueStore<
    StateValue extends IDSStateValue<Value>,
    Key,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends IDSValueStoreBase {
    storeName: StoreName;
    // storeManager: IDSStoreManager | undefined;
    // stateVersion: number;
    // listenToAnyStore: boolean;
    // isDirty: boolean;

    getEntities():{key:Key, stateValue:StateValue}[];
    setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void;

    emitDirtyFromValueChanged(stateValue?: StateValue, properties?: Set<keyof Value>): void;
    emitDirty(stateValue?: StateValue, properties?: Set<keyof Value>): void;
    listenEmitDirty(msg: string, callback: DSEmitDirtyHandler<StateValue, Value>): DSUnlisten;
    unlistenEmitDirty(callback: DSEmitDirtyHandler<StateValue, Value>): void;
    listenDirtyRelated<
        RelatedValueStore extends IDSValueStore<RelatedStateValue, RelatedKey, RelatedValue, RelatedStoreName>,
        RelatedStateValue extends IDSStateValue<RelatedValue> = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue'],
        RelatedKey = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['key'],
        RelatedValue =  ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue']['value'],
        RelatedStoreName extends string = RelatedValueStore['storeName']
        >(msg: string, relatedValueStore: RelatedValueStore): DSUnlisten;

    unlistenDirtyRelated<
        RelatedValueStore extends IDSValueStore<RelatedStateValue, RelatedKey, RelatedValue, RelatedStoreName>,
        RelatedStateValue extends IDSStateValue<RelatedValue> = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue'],
        RelatedKey = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['key'],
        RelatedValue =  ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue']['value'],
        RelatedStoreName extends string = RelatedValueStore['storeName']
    >(relatedValueStore: RelatedValueStore): void;

    processDirty(): void;

    emitUIUpdate(uiStateValue: IDSUIStateValue<Value>): void;

    emitEvent<
        Event extends DSEvent<Payload, EventType, StoreName>,
        Payload = Event['payload'],
        EventType extends string = Event['event'],
        >(eventType: Event['event'], payload: Event['payload']): DSEventHandlerResult;

    listenEvent<
        Event extends DSEvent<Payload, string, StoreName>,
        Payload = Event['payload']
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten;

    // listenEventAnyStore<
    //     Payload = any,
    //     EventType extends string = string,
    //     StoreName extends string = string
    // >(msg: string, event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten;

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

export type IDSAnyValueStore = IDSValueStore<any, any, any, string>;

export interface IDSObjectStore<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends IDSValueStore<StateValue, "stateValue", Value, StoreName> {
    stateValue: StateValue;

    listenEventValue(msg: string, callback: DSEventValueHandler<StateValue, StoreName, Value>): DSUnlisten;
}

export type ConfigurationDSValueStore<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value']
    > = {
        postAttached?: () => void;
    }

export interface IDSArrayStore<
    StateValue extends IDSStateValue<Value>,
    Key = number,
    Value = StateValue['value'],
    StoreName extends string = string
    > extends IDSValueStore<StateValue, Key, Value, StoreName> {
    // stateValue: StateValue;

    //listenEventValue(msg: string, callback: DSEventValueHandler<StateValue, StoreName, Value>): DSUnlisten;
}
export type ConfigurationDSArrayValueStore<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value']
    > = ConfigurationDSValueStore<StateValue, Value> & {
        create?: ((value: Value) => StateValue);
    }

export interface IDSMapStore<
    StateValue extends IDSStateValue<Value>,
    Key = string,
    Value = StateValue['value'],
    StoreName extends string = string
    > {

}

export type ConfigurationDSMapValueStore<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value']
    > = ConfigurationDSValueStore<StateValue, Value> & {
        create?: ((value: Value) => StateValue);
    }

export type ConfigurationDSEntityValueStore<
    StateValue extends IDSStateValue<Value>,
    Key = string,
    Value = StateValue['value'],
    > = ConfigurationDSValueStore<StateValue, Value> & {
        create?: (value: Value) => StateValue;
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

export type IDSValueStoreWithValue<Value> = IDSValueStore<IDSStateValue<Value>, any, Value, string>

export interface IDSPropertiesChanged<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value']
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

export type WrappedDSStateValue<Entity> = (Entity extends IDSStateValue<infer Value> ? (Value extends IDSStateValue<Value> ? Value : Entity) : (IDSStateValue<Entity>));

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
    {
        storeName: StoreName;
        event: EventType;
        payload: Payload;
    };

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
    Index extends number | never = never,
    StoreName extends string = string
    > = DSEvent<DSPayloadEntity<Entity, Key, Index>, "attach", StoreName>;

export type DSEventDetach<
    Entity = any,
    Key extends any | never = never,
    Index extends number | never = never,
    StoreName extends string = string
    > = DSEvent<DSPayloadEntity<Entity, Key, Index>, "detach", StoreName>;

export type DSPayloadEntityPropertiesChanged<
    StateValue extends IDSStateValue<Value> | undefined,
    Value = Exclude<StateValue, undefined>['value']
    > = ({
        entity: StateValue;
        properties?: Set<keyof Exclude<StateValue, undefined>['value']> | undefined
    });

export type DSEventValue<
    StateValue extends IDSStateValue<Value> | undefined = IDSStateValue<any> | undefined,
    StoreName extends string = string,
    Value = any
    > = DSEvent<DSPayloadEntityPropertiesChanged<StateValue>, "value", StoreName>;

export type DSEmitDirtyHandler<StateValue, Value> = (stateValue?: StateValue, properties?: Set<keyof Value>) => void;

export type DSEventHandlerResult = (Promise<any | void> | void);

export type DSEventHandler<
    Payload = any,
    EventType extends string = string,
    StoreName extends string = string
    > = (event: DSEvent<Payload, EventType, StoreName>) => DSEventHandlerResult;

export type DSEventValueHandler<
    StateValue extends IDSStateValue<Value> | undefined,
    StoreName extends string,
    Value
    > = (event: DSEvent<DSPayloadEntityPropertiesChanged<StateValue>, "value", StoreName>) => DSEventHandlerResult;


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
