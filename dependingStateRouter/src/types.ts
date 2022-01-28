import { DSEvent } from 'dependingState';
import type {
    Action as HistoryAction,
    Location as HistoryLocation,
    State as HistoryState,
    To as HistoryTo,
    UpdateMode
} from './history';

export type NavigatorSetLocationPayload<NavigatorPage = string, NavigatorPathArguments = {}> = {
    page: NavigatorPage;
    pathArguments: NavigatorPathArguments;
    /** the logical name */
    // pathPattern?: string,
    // isExact?: boolean;
    to?: HistoryTo;
    eventToProcess?: DSEvent<any, any, string> | undefined;
};
export type IDSNavigatorValue<NavigatorPageName = string, NavigatorPathArguments = PathArgumentsAny> = {
    page: NavigatorPageName;
    pathArguments: NavigatorPathArguments;
    // pathPattern: string,
    // isExact: boolean;
    // to?:HistoryTo;
}

export interface IDSRouterValue<S extends HistoryState = HistoryState> {
    action: HistoryAction | string;
    location: RouterLocation<S>;
    updateMode: UpdateMode;
}

export interface RouterLocation<S extends HistoryState = HistoryState> extends HistoryLocation<HistoryState> {
    query: Record<string, string>
}

export interface RouteDefinition<
    Path extends string = string
    > {
    path?: Path | readonly Path[];
    exact?: boolean;
    sensitive?: boolean;
    strict?: boolean;
}

export type LocationDescriptorObject = {
    to: HistoryTo;
    state?: HistoryLocation | undefined;
}

// push & replace
export type LocationParameter = {
    to: HistoryTo;
    state?: HistoryLocation | undefined;
    updateMode?: UpdateMode;
    noListener?: boolean | undefined;
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

import type { matchPath } from './matchPath';

export type PathParam = Parameters<typeof matchPath>[1];

export interface match<Params extends { [K in keyof Params]?: string } = {}> {
    params: Params;
    isExact: boolean;
    path: string;
    url: string;
}

export type PathArgumentsString = {
    [key in string]: string
}

export type PathArgumentsAny = {
    [key in string]: any | undefined
}

export type ConvertPageParametersResult<NavigatorPageName extends string = string, PathArguments extends PathArgumentsAny = PathArgumentsAny> = { 
    pageName: NavigatorPageName;
    pathArguments: PathArguments ;
}