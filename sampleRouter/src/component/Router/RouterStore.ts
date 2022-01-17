import {
    DSStateValueSelf,
    ConfigurationDSValueStore
} from "dependingState";

import {
    //dsRouterBuilder,
    History,
    HistoryState,
    IDSRouterValue,
    DSRouterStore
} from "dependingStateRouter";


// dsRouterBuilder.createAction

export class RouterValue extends DSStateValueSelf<RouterValue> implements IDSRouterValue {
    constructor() {
        super();
    }
}

export type LocationState = undefined;

export class RouterStore<LocationState> extends DSRouterStore<RouterValue, RouterValue> {
    constructor(
        history: History<LocationState>,
        stateValue: RouterValue,
        configuration?: ConfigurationDSValueStore<RouterValue, RouterValue>
    ) {
        super(history, stateValue, configuration);
    }
}