import {
    ConfigurationDSValueStore
} from "dependingState";

import {
    //dsRouterBuilder,
    History,
    HistoryState,
    DSRouterStore,
    createBrowserHistory
} from "dependingStateRouter";

import { RouterValue } from "./RouterValue";

export type LocationState = HistoryState;

export class RouterStore extends DSRouterStore<RouterValue, RouterValue> {
    constructor(
        history?: History<LocationState>,
        stateValue?: RouterValue,
        configuration?: ConfigurationDSValueStore<RouterValue, RouterValue>
    ) {
        super(
            (history == undefined) ? createBrowserHistory() : history,
            (stateValue === undefined) ? new RouterValue() : stateValue,
            configuration);
    }
}
