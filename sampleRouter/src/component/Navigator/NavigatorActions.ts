import type { DSStoreAction } from 'dependingState';
import{
    navigatorBuilder,
    navigatorSetLocation,
    NavigatorSetLocationPayload
} from 'dependingStateRouter'
import  type { NavigatorPageName, NavigatorPathArguments } from './NavigatorValue';

export const appNavigatorBuilder = navigatorBuilder;
export const appNavigatorSetLocation = navigatorSetLocation as DSStoreAction<NavigatorSetLocationPayload<NavigatorPageName, NavigatorPathArguments>, "setLocation", "navigator">

