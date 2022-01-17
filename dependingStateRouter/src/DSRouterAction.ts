import{
    DSEvent,
    storeBuilder,
    DSStoreAction
} from 'dependingState';

// import type {
//     Location as HistoryLocation,
//     State as HistoryState,
    
// } from './history';

// import {
//     IDependingRouterValue,
// } from './IDependingRouterValue';

import { LocationParameter } from './types';

export const dsRouterBuilder = storeBuilder("router");

export type PushPayload=LocationParameter;
export const routerPush = dsRouterBuilder.createAction<PushPayload, "push">("push");

//export type PushEvent = DSEvent<PushPayload, "push", "router">;

export type ReplacePayload=LocationParameter;
export const routerReplace = dsRouterBuilder.createAction<ReplacePayload, "replace">("replace");
//export type ReplaceEvent=DSEvent<ReplacePayload>;