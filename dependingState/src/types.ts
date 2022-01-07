import type React from 'react';
import type { DSStateValue } from './DSStateValue';

export type DSEventName<EventType extends string = string> = {
    storeName: string;
    event: EventType;
};

export type DSEvent<Payload = any, EventType extends string = string> =
    DSEventName<EventType> &
    (
        Payload extends never
        ? {}
        : {
            payload: Payload;
        }
    );
export type DSPayloadEntity<Entity = any> = { entity: DSStateValue<Entity>, key?: any, index?:number };
export type DSEventAttach<Entity = any> = DSEvent<DSPayloadEntity<Entity>, "attach">;
export type DSEventDetach<Entity = any> = DSEvent<DSPayloadEntity<Entity>, "detach">;
export type DSEventValue<Entity = any> = DSEvent<DSPayloadEntity<Entity>, "value">;

export type DSDirtyHandler<Value = any> = (stateValue: DSStateValue<Value>) => void;
export type DSEventHandlerResult = (Promise<any | void> | void);
export type DSEventHandler<Payload = any, EventType extends string = any> = (event: DSEvent<Payload, EventType>) => DSEventHandlerResult;
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
    key?:string|number;
};
