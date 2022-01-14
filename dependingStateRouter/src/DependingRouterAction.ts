import{
    storeBuilder
} from 'dependingState';

import {
    IDependingRouterValue,
} from './IDependingRouterValue';

export const dependingRouterBuilder = storeBuilder("router");

export type PushPayload={};
export const routerPush = dependingRouterBuilder.createAction<PushPayload>("push");

export type ReplacePayload={};
export const routerReplace = dependingRouterBuilder.createAction<ReplacePayload>("replace");