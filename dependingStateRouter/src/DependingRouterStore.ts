import type {
    // Action as HistoryAction,
    // Location as HistoryLocation,
    State as HistoryState,
    History,
    // To as HistoryTo,
    // Update as HistoryUpdate,
} from './history';

import type {
    RouterState
} from './types';

import type {
    IDependingRouterValue
} from './IDependingRouterValue';

import {
    IDSStateValue,
    DSObjectStore,
    ConfigurationDSValueStore
} from 'dependingState';

import {
    injectQuery
} from './injectQuery';

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
function noop() { }
export class DependingRouterStore<
    Value extends IDependingRouterValue = IDependingRouterValue,
    StateValue extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),
    > extends DSObjectStore<Value, StateValue, "router">{
    history: History<HistoryState>;
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
        this.suspressListener = true;
    }

    /*    
        public postAttached(): void {
            routerPush.listenEvent("push", (e) => {
                const location = e.payload;
                const locationPC = getPropertiesChanged(this.stateValue);
                this.setNormalizedLocation(location, locationPC);
                locationPC.giveBack();
                this.suspressListener = true;
                this.history.push(location.to, location.state, location.updateMode ?? UpdateMode.FromBrowser, false);
            });
    
            routerReplace.listenEvent("replace", (e) => {
                const location = e.payload;
                const locationPC = getPropertiesChanged(this.stateValue);
                this.setNormalizedLocation(location, locationPC);
                locationPC.giveBack();
                this.suspressListener = true;
                this.history.replace(location.to, location.state, location.updateMode ?? UpdateMode.FromBrowser, false);
            });
    
            this.subscribe();
        }
    
    
        setNormalizedLocation(
            location: HistoryLocation<any>,
            locationPC: IDSPropertiesChanged<DependingRouterValue>
        ): boolean {
            const locationNormalized = injectQuery(location as any);
            *
                const { location, action: payloadAction, page } = action.payload;
                        const locationNormalized = injectQuery(location as any);
                        const actionNormalized = payloadAction || "PUSH";
        
                        let changed=false;
                        if (state.action !== actionNormalized) {
                            state.action = actionNormalized;
                            changed=true;
                        }
                        if ((locationNormalized.pathname !== state.location.pathname)
                            || (locationNormalized.hash !== state.location.hash)
                            || !equal(locationNormalized.query, state.location.query)
                            || !equal(locationNormalized.state, state.location.state)
                        ) {
                            state.location = locationNormalized;
                            changed=true;
                        }
                        if ((page !== undefined) && (state.page !== page)) {
                            state.page = page;
                            changed=true;
                        }
                        if (changed){
                            state.version=state.version+1;
                        }
                *
    
            return false;
        }
    
        extractValues(locationPC: IDSPropertiesChanged<DependingRouterValue>) {
            // navigation?
            // AppPath, handleLocationChanged this.stateValue, locationPC
        }
    
        historyListener(update: Update<any>): void {
            if (this.suspressListener) {
                this.suspressListener = false;
            } else {
                // convert update to something usefull
                const locationPC = getPropertiesChanged(this.stateValue);
                this.setNormalizedLocation(update.location, locationPC);
                this.extractValues(locationPC);
                locationPC.valueChangedIfNeeded();
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
    */
}
