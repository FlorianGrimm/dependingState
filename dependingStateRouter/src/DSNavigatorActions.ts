import {
    DSEvent,
    storeBuilder,
} from 'dependingState';

export const navigatorBuilder = storeBuilder("navigator");

export type NavigatorSetLocationPayload<NavigatorPage = string, NavigatorPathArguments = {}> = {
    page: NavigatorPage;
    pathArguments: NavigatorPathArguments;
    /** the logical name */
    pathName?: string,
    isExact?: boolean;
    to?: string;
    eventToProcess?: DSEvent<any, any, string> | undefined;
};
export const navigatorSetLocation = navigatorBuilder.createAction<NavigatorSetLocationPayload>("setLocation");
export type NavigatorChangePageEvent = DSEvent<NavigatorSetLocationPayload, "setLocation", "navigator">;
