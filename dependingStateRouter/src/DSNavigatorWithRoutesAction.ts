// import {
//     DSEvent,
//     storeBuilder,
// } from 'dependingState';
import { navigatorBuilder } from './DSNavigatorActions';

// import type { NavigatorSetLocationPayload } from './types';

export const navigatorWithRoutesBuilder = navigatorBuilder;
// export const navigatorSetLocation = navigatorBuilder.createAction<NavigatorSetLocationPayload, "setLocation">("setLocation");
// export type NavigatorChangePageEvent = DSEvent<NavigatorSetLocationPayload, "setLocation", "navigator">;
