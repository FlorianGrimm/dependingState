import type React from 'react';
import type { DSUIStateValue } from './DSUIStateValue';

export interface IDSStoreManager {
    getNextStateVersion(stateVersion: number): number;

    attach(valueStore: IDSValueStore): this;
    postAttached(): void;
    updateRegisteredEvents(): void;
    resetRegisteredEvents(): void;

    emitUIUpdate(uiStateValue: IDSUIStateValue): void;
    emitEvent(event: DSEvent): DSEventHandlerResult;
    process(msg?: string, fn?: () => DSEventHandlerResult): DSEventHandlerResult;

    processUIUpdates(): void;
}

export interface IDSStoreBuilder<StoreName extends string = string> {
    createAction<
        Payload,
        EventType extends string = string
    >(
        event: EventType
    ): IDSStoreAction<Payload, EventType, StoreName>;

    bindValueStore(valueStore: IDSValueStore<any, any, StoreName>): void;
}

export interface IDSStoreAction<
    Payload,
    EventType extends string = string,
    StoreName extends string = string
    > {
    bindValueStore(valueStore: IDSValueStore<any, any, StoreName>): void;

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

export interface IDSValueStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = IDSStateValue<Value>,
    StoreName extends string = string
    //Value = StateValue['value']
    > {
    storeName: string;
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    listenToAnyStore: boolean;
    isDirty: boolean;

    setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void;
    postAttached(storeManager: IDSStoreManager): void;

    getNextStateVersion(stateVersion: number): number;

    listenDirtyRelated<RelatedValueStore extends IDSValueStore>(msg: string, relatedValueStore: RelatedValueStore): DSUnlisten;
    unlistenDirtyRelated<RelatedValueStore extends IDSValueStore>(relatedValueStore: RelatedValueStore): void;
    emitDirtyFromValueChanged(stateValue?: StateValue, properties?: Set<keyof Value>): void;
    emitDirty(stateValue?: StateValue, properties?: Set<keyof Value>): void;
    listenDirty(msg: string, callback: DSDirtyHandler<StateValue, Value>): DSUnlisten;
    unlistenDirty(callback: DSDirtyHandler<StateValue, Value>): void;
    processDirty(): void;

    emitUIUpdate(uiStateValue: IDSUIStateValue<Value>): void;

    emitEvent<
        Event extends DSEvent<any, string, StoreName>
    >(eventType: Event['event'], payload: Event['payload']): DSEventHandlerResult;

    listenEvent<
        Event extends DSEvent<any, string, StoreName>
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten;

    listenEventAnyStore<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(msg: string, event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten;

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

/*
export interface x<
    StateValue extends IDSStateValue<Value>,
    Value = StateValue['value']
>{

}
*/
export interface IDSObjectStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = IDSStateValue<Value>,
    StoreName extends string = string
    > extends IDSValueStore {
    stateValue:StateValue;

    //listenEventValue<Event extends DSEventValue<StateValue, StoreName>>(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten;
    listenEventValue(msg: string, callback: DSEventValueHandler<StateValue, StoreName, Value>): DSUnlisten;

    // combineValueStateFromObjectStore<
    //     OtherStore extends IDSObjectStore<OtherValue, OtherStateValue, OtherStoreName>,
    //     PropertyName extends keyof Value,
    //     OtherValue = any,
    //     OtherStateValue extends IDSStateValue<OtherValue> = IDSStateValue<OtherValue>,
    //     OtherStoreName extends string = string,
    //     >(
    //         name: PropertyName,
    //         getStore: (() => OtherStore)
    //     ):void;

}

export type ConfigurationDSValueStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>)
    > = {
        postAttached?: () => void;
    }

export type ConfigurationDSArrayValueStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>)
    > = ConfigurationDSValueStore<Value, StateValue> & {
        create?: ((value: Value) => StateValue);
    }

export type ConfigurationDSMapValueStore<
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>)
    > = ConfigurationDSValueStore<Value, StateValue> & {
        create?: ((value: Value) => StateValue);
    }

export type ConfigurationDSEntityValueStore<
    Key = any,
    Value = any,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>)
    > = ConfigurationDSValueStore<Value, StateValue> & {
        create?: (value: Value) => StateValue;
        getKey: (value: Value) => Key;
    }

export interface IDSStateValue<Value = any> {
    isDirty: boolean;
    store: IDSValueStore<Value> | undefined;
    stateVersion: number;
    //uiStateValue: DSUIStateValue<Value> | undefined;
    value: Value;
    valueChanged(properties?: Set<keyof Value> | undefined): void;
    getUIStateValue(): DSUIStateValue<Value>;
    setStore(store: IDSValueStore<Value>): boolean;

    getViewProps(): DSUIProps<Value>;
    emitUIUpdate(): void;
    triggerUIUpdate(): void;
    triggerScheduled: boolean;
}

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
    StateValue extends (IDSStateValue<any> | undefined)
    > = ({
        entity: StateValue;
        properties?: Set<keyof Exclude<StateValue, undefined>['value']> | undefined
    });

export type DSEventValue<
    StateValue extends IDSStateValue<Value> | undefined = IDSStateValue<any> | undefined,
    StoreName extends string = string,
    Value = any
    > = DSEvent<DSPayloadEntityPropertiesChanged<StateValue>, "value", StoreName>;

export type DSDirtyHandler<StateValue, Value> = (stateValue?: StateValue, properties?: Set<keyof Value>) => void;

export type DSEventHandlerResult = (Promise<any | void> | void);

export type DSEventHandler<
    Payload = any,
    EventType extends string = string,
    StoreName extends string = string
    > = (event: DSEvent<Payload, EventType, StoreName>) => DSEventHandlerResult;

export type DSEventValueHandler<
    StateValue extends IDSStateValue<Value> | undefined ,
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
