import type { DSStoreAction } from 'dependingState';
import {
    navigatorBuilder,
    navigatorSetLocation,
    NavigatorSetLocationPayload
} from 'dependingStateRouter'
import type { NavigatorPageName, NavigatorPathArguments } from './NavigatorValue';

export const appNavigatorBuilder = navigatorBuilder;
export const appNavigatorSetLocation = navigatorSetLocation as DSStoreAction<NavigatorSetLocationPayload<NavigatorPageName, NavigatorPathArguments>, "setLocation", "navigator">

export type PageAParameter = { a: number; b: number } | undefined;
export type PageBParameter = { a: number; b: number } | undefined;

export const navigateToHome = appNavigatorBuilder.createAction<undefined>("navigateToHome");
export const navigateToPageA = appNavigatorBuilder.createAction<PageAParameter>("navigateToPageA");
export const navigateToPageB = appNavigatorBuilder.createAction<PageBParameter>("navigateToPageB");
