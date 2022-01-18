import {
    DSEvent,
    storeBuilder,
} from 'dependingState';

export const navigatorBuilder = storeBuilder("navigator");

export type NavigatorSetLocationPayload<Page=string, PathName=string, T={}> = { 
    page:Page; 
    pathName:PathName;
    pathArguments:T;
    to?:string;
    eventToProcess?:DSEvent<any,any,string>|undefined;
};
export const navigatorSetLocation = navigatorBuilder.createAction<NavigatorSetLocationPayload>("setLocation");
export type NavigatorChangePageEvent = DSEvent<NavigatorSetLocationPayload, "setLocation", "navigator">;
