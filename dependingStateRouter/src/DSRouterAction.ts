import type {
    State as HistoryState,
} from './history';

import type { 
    IDSRouterValue, 
    LocationParameter 
} from './types';

import {
    DSEvent,
    storeBuilder,
} from 'dependingState';


export const dsRouterBuilder = storeBuilder("router");

export type PushPayload = LocationParameter;
export const routerPush = dsRouterBuilder.createAction<PushPayload, "push">("push");
export type PushEvent = DSEvent<PushPayload, "push", "router">;

export type ReplacePayload = LocationParameter;
export const routerReplace = dsRouterBuilder.createAction<ReplacePayload, "replace">("replace");
export type ReplaceEvent = DSEvent<ReplacePayload, (typeof routerReplace)['event'], (typeof routerReplace)['storeName']>;

export type LocationChangedPayload = IDSRouterValue<HistoryState>;
export const routerLocationChanged = dsRouterBuilder.createAction<LocationChangedPayload, "locationChanged">("locationChanged");
export type LocationChangedEvent = DSEvent<LocationChangedPayload, "locationChanged", "router">;
