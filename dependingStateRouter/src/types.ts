import type {
    Action as HistoryAction,
    Location as HistoryLocation,
    State as HistoryState,
    History,
    To as HistoryTo,
    Update as HistoryUpdate,
    UpdateMode,
    To,
} from './history';

export interface RouterLocation<S extends HistoryState = HistoryState> extends HistoryLocation<HistoryState> {
    query: Record<string, string>
}

export interface RouterState {
    location: RouterLocation;
    action: HistoryAction | string;
}

// import { Pages } from '~/enums';

export interface RouteDefinition<
    Path extends string = string
    > {
    path?: Path | readonly Path[];
    exact?: boolean;
    sensitive?: boolean;
    strict?: boolean;
}

export type LocationDescriptorObject = {
    to: To;
    state?: HistoryLocation | undefined;
}

// push & replace
export type LocationParameter = {
    to: To;
    state?: HistoryLocation | undefined;
    updateMode?: UpdateMode;
    noListener?: boolean | undefined;
}

export interface RouterRootState {
    router: RouterState;
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
