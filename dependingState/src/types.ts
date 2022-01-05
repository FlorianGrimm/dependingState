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
export type DSEventAttach<Payload = any> = DSEvent<DSStateValue<Payload>, "attach">;
export type DSEventDetach<Payload = any> = DSEvent<DSStateValue<Payload>, "detach">;
export type DSEventValue<Payload = any> = DSEvent<DSStateValue<Payload>, "value">;

export type DSEventHandlerResult = (Promise<any | void> | void);
export type DSEventHandler<Payload = any, EventType extends string = string> = (event: DSEvent<Payload, EventType>) => DSEventHandlerResult;
export type DSUnlisten = (() => void);

export type DSUIViewState<T = any> = T & DSUIViewStateBase;

export type DSUIViewStateBase = {
    stateVersion: number;
};

export type DSUIProps<Value = any> = {
    getViewProps: () => Value;
    wireStateVersion<Props extends Value = any, State extends DSUIViewStateBase = any>(component: React.Component<Props, State>): void;
    unwireStateVersion<Props extends Value = any, State extends DSUIViewStateBase = any>(component: React.Component<Props, State>): void;
    getStateVersion(): number;
};
