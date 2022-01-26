import {
    DSEvent,
    storeBuilder,
} from 'dependingState';

import type { NavigatorSetLocationPayload } from './types';

export const navigatorBuilder = storeBuilder("navigator");
export const navigatorSetLocation = navigatorBuilder.createAction<NavigatorSetLocationPayload, "setLocation">("setLocation");
export type NavigatorChangePageEvent = DSEvent<NavigatorSetLocationPayload, "setLocation", "navigator">;
