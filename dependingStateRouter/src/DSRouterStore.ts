import {
    // Action as HistoryAction,
    Location as HistoryLocation,
    State as HistoryState,
    History,
    UpdateMode,
    // To as HistoryTo,
    Update as HistoryUpdate
} from './history';

import type {
    RouterState
} from './types';

import type {
    IDSRouterValue
} from './IDSRouterValue';

import {
    IDSStateValue,
    DSObjectStore,
    ConfigurationDSValueStore,
    IDSPropertiesChanged,
    getPropertiesChanged
} from 'dependingState';

import {
    injectQuery
} from './injectQuery';

import { DSRouterValue } from './DSRouterValue';

import { PushEvent, ReplaceEvent, routerPush, routerReplace } from './DSRouterAction';

function noop() { }

// Define the initial state using that type
function getInitialState() {
    const result: RouterState = {
        location: injectQuery({
            pathname: window.location.pathname,
            search: window.location.search,
            state: null,
            hash: window.location.hash,
            query: {}
        } as any),
        action: "PUSH"
    }
    return result;
}

export class DSRouterStore<
    Value extends IDSRouterValue = IDSRouterValue,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),
    LocationState extends HistoryState = HistoryState
    > extends DSObjectStore<Value, StateValue, "router">{
    history: History<LocationState>;
    historyUnlisten: () => void;
    suspressListener: boolean;

    constructor(
        history: History<LocationState>,
        stateValue: StateValue,
        configuration?: ConfigurationDSValueStore<Value, StateValue>
    ) {
        super("router", stateValue, configuration);
        this.history = history;
        this.historyUnlisten = noop;
        this.suspressListener = false;
    }

    public postAttached(): void {
        routerPush.listenEvent("push", (e) => {
            const location = e.payload;
            // const locationPC = getPropertiesChanged(this.stateValue);
            // this.setNormalizedLocation(location, locationPC);
            // locationPC.giveBack();
            this.suspressListener = true;
            // (location.noListener == undefined) ? true : location.noListener
            this.history.push(location.to, location.state as unknown as (LocationState | undefined), location.updateMode ?? UpdateMode.FromCode, false);
        });

        routerReplace.listenEvent("replace", (e) => {
            const location = e.payload;
            // const locationPC = getPropertiesChanged(this.stateValue);
            // this.setNormalizedLocation(location, locationPC);
            // locationPC.giveBack();
            this.suspressListener = true;
            // (location.noListener == undefined) ? true : location.noListener
            this.history.replace(location.to, location.state as unknown as (LocationState | undefined), location.updateMode ?? UpdateMode.FromCode, false);
        });

        this.subscribe();
    }

    // setNormalizedLocation(
    //     location: HistoryLocation<LocationState>,
    //     locationPC: IDSPropertiesChanged<StateValue>
    // ): boolean {
    //     const locationNormalized = injectQuery(location);

    //     /*
    //     const { location, action: payloadAction, page } = action.payload;
    //     const locationNormalized = injectQuery(location as any);
    //     const actionNormalized = payloadAction || "PUSH";

    //     let changed = false;
    //     if (state.action !== actionNormalized) {
    //         state.action = actionNormalized;
    //         changed = true;
    //     }
    //     if ((locationNormalized.pathname !== state.location.pathname)
    //         || (locationNormalized.hash !== state.location.hash)
    //         || !equal(locationNormalized.query, state.location.query)
    //         || !equal(locationNormalized.state, state.location.state)
    //     ) {
    //         state.location = locationNormalized;
    //         changed = true;
    //     }
    //     if ((page !== undefined) && (state.page !== page)) {
    //         state.page = page;
    //         changed = true;
    //     }
    //     if (changed) {
    //         state.version = state.version + 1;
    //     }
    //     */

    //     return false;
    // }

    // extractValues(locationPC: IDSPropertiesChanged<StateValue>) {
    //     // navigation?
    //     // AppPath, handleLocationChanged this.stateValue, locationPC
    // }

    historyListener(update: HistoryUpdate<LocationState>): void {
        if (this.suspressListener) {
            this.suspressListener = false;
        } else {
            // convert update to something usefull
            // const locationPC = getPropertiesChanged(this.stateValue);
            // this.setNormalizedLocation(update.location, locationPC);
            // this.extractValues(locationPC);
            // locationPC.valueChangedIfNeeded();
        }
    }

    subscribe() {
        this.unsubscribe();
        this.historyUnlisten = this.history.listen(this.historyListener.bind(this));
        this.historyListener({ location: this.history.location, action: this.history.action, updateMode: UpdateMode.Initialization });
    }

    unsubscribe() {
        this.historyUnlisten();
        this.historyUnlisten = () => { };
    }
}
