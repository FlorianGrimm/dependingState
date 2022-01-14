/*

import { Pages } from '~/enums';

import type {
    Action as HistoryAction,
    Location as HistoryLocation,
    History,
    To,
    Update,
    UpdateMode
} from '../history';

export interface RouteDefinition<
    Path extends string = string
    > {
    path?: Path | readonly Path[];
    exact?: boolean;
    sensitive?: boolean;
    strict?: boolean;
}

export type LocationState = {
}

export type LocationDescriptorObject = {
    to: To;
    state?: LocationState | undefined;
}

// push & replace
export type LocationParameter = {
    to: To;
    state?: LocationState | undefined;
    updateMode?: UpdateMode;
    noListener?: boolean | undefined;
}

export interface RouterRootState {
    router: RouterState;
}

export interface RouterLocation extends HistoryLocation<LocationState> {
    query: Record<string, string>
}

export interface RouterState {
    location: RouterLocation;
    action: HistoryAction | string;
    version: number;
    page: Pages;
}

export interface RouteProps<
    Path extends string = string
    > {
    location?: HistoryLocation;
    path?: Path | readonly Path[];
    exact?: boolean;
    sensitive?: boolean;
    strict?: boolean;
}

// import type { LOCATION_CHANGE } from './reduxRouterAction';

// export interface LocationChangeAction {
//     type: typeof LOCATION_CHANGE;
//     payload: LocationChangePayload;
// }

// export interface LocationChangePayload {
//     location: RouterLocation | Location;
//     action: HistoryAction | string;
//     page?: Pages | undefined;
// }

import type { matchPath } from './matchPath';
export type PathParam = Parameters<typeof matchPath>[1];

// export type HandleLocationChangedFunc = (
//     update: Update<LocationState>,
//     store: Store<RouterRootState, any>
// ) => HandleLocationChangedResult;

// export type HandleLocationChangedResult = ((ReduxAction | AsyncThunkAction<unknown, unknown, any> | undefined)[] | undefined);

export interface match<Params extends { [K in keyof Params]?: string } = {}> {
    params: Params;
    isExact: boolean;
    path: string;
    url: string;
}

// export type ReduxRouterServiceArguments = {
//     history: History<LocationState>;
// //     //store: Store<RouterRootState, any>;
//      onLocationChanged?: HandleLocationChangedFunc;
//      stateCompareFunction?: /*IsEqualCustomizer*/ any;
// //     noInitialPop?: boolean;
// //     noTimeTravelDebugging?: boolean;
// }

*/