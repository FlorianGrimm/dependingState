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
export interface IDSStoreManagerInternal extends IDSStoreManager{
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
    Key,
    Value = any,
    StoreName extends string = string
    > extends IDSValueStoreBase {
    storeName: StoreName;
    // storeManager: IDSStoreManager | undefined;
    // stateVersion: number;
    // listenToAnyStore: boolean;
    // isDirty: boolean;

    getEntities():{key:Key, stateValue:IDSStateValue<Value>}[];
    setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void;

    emitDirtyFromValueChanged(stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void;
    emitDirty(stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void;
    listenEmitDirty(msg: string, callback: DSEmitDirtyHandler<Value>): DSUnlisten;
    unlistenEmitDirty(callback: DSEmitDirtyHandler<Value>): void;
    listenDirtyRelated<
        RelatedValueStore extends IDSValueStore<RelatedKey, RelatedValue, RelatedStoreName>,
        RelatedKey = ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['key'],
        RelatedValue =  ArrayElement<ReturnType<RelatedValueStore["getEntities"]>>['stateValue']['value'],
        RelatedStoreName extends string = RelatedValueStore['storeName']
        >(msg: string, relatedValueStore: RelatedValueStore): DSUnlisten;

    unlistenDirtyRelated<
        RelatedValueStore extends IDSValueStore<RelatedKey, RelatedValue, RelatedStoreName>,
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
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], Event['storeName']>): DSUnlisten;

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

export type IDSAnyValueStore = IDSValueStore<any, any, string>;

export interface IDSObjectStore<
    Value = any,
    StoreName extends string = string
    > extends IDSValueStore<"stateValue", Value, StoreName> {
    stateValue: IDSStateValue<Value>;

    listenEventValue(msg: string, callback: DSEventEntityVSValueHandler<Value, StoreName>): DSUnlisten;
}

export type ConfigurationDSValueStore<    Value    > = {
        postAttached?: () => void;
    }

export interface IDSArrayStore<
    Key = number,
    Value = any,
    StoreName extends string = string
    > extends IDSValueStore<Key, Value, StoreName> {
    attach(stateValue:IDSStateValue<Value>):void;
    detach(stateValue:IDSStateValue<Value>):void;    
    //listenEventValue(msg: string, callback: DSEventValueHandler<IDSStateValue<Value>, StoreName, Value>): DSUnlisten;
}
export type ConfigurationDSArrayValueStore<    Value    > = ConfigurationDSValueStore< Value> & {
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
        postPromise? : Promise<any>
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
