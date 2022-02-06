import {
    // Action as HistoryAction,
    Location as HistoryLocation,
    State as HistoryState,
    History,
    UpdateMode,
    To as HistoryTo,
    Update as HistoryUpdate
} from './history';

import type {
    IDSRouterValue
} from './types';

import {
    IDSStateValue,
    DSObjectStore,
    ConfigurationDSValueStore,
    getPropertiesChanged,
    DSEventHandler,
    DSUnlisten,
    DSEventHandlerResult,
    dsLog
} from 'dependingState';

import {
    injectQuery
} from './injectQuery';

import {
    routerLocationChanged,
    routerPush,
    routerReplace,
    dsRouterBuilder,
    LocationChangedEvent,
    LocationChangedPayload
} from './DSRouterAction';

import type { DSRouterValue } from './DSRouterValue';
import { Path } from './history';
import { catchLog } from 'dependingState';

function noop() { }

// Define the initial state using that type
export function getRouterValueInitial(): IDSRouterValue {
    const result: IDSRouterValue = {
        location: {
            pathname: window.location.pathname,
            search: window.location.search,
            state: null,
            hash: window.location.hash,
            query: {},
            key: ""
        },
        action: "PUSH",
        updateMode: UpdateMode.Initialization
    }
    return result;
}

export interface IDSRouterStore {
    /**
     * push history if needed - suspress navigator - since this is the caller.
     * @param to new loaction
     */
    setLocationFromNavigator(to: HistoryTo): void;

    /**
     * add callback for locationChanged (externaly)
     * @param msg dsLog message
     * @param callback the callback
     */
    listenEventLocationChanged(msg: string, callback: DSEventHandler<LocationChangedPayload, "locationChanged", "router">): DSUnlisten;
}

export class DSRouterStore<
    Value extends IDSRouterValue = DSRouterValue,
    LocationState extends HistoryState = HistoryState
    > extends DSObjectStore<Value, "router"> implements IDSRouterStore {
    history: History<LocationState>;
    historyUnlisten: () => void;
    suspressNavigator: boolean;

    constructor(
        history: History<LocationState>,
        stateValue: IDSStateValue<Value>,
        configuration?: ConfigurationDSValueStore<Value>
    ) {
        super("router", stateValue, configuration);
        this.history = history;
        this.historyUnlisten = noop;
        this.suspressNavigator = false;
        dsRouterBuilder.bindValueStore(this);
    }

    public initializeStore(): void {
        routerPush.listenEvent("router/push", (e) => {
            const location = e.payload;
            if (e.payload.noListener === true) {
                this.suspressNavigator = true;
            }
            this.history.push(location.to, location.state as unknown as (LocationState | undefined), location.updateMode ?? UpdateMode.FromCode, false);
        });

        routerReplace.listenEvent("router/replace", (e) => {
            const location = e.payload;
            if (e.payload.noListener === true) {
                this.suspressNavigator = true;
            }
            this.history.replace(location.to, location.state as unknown as (LocationState | undefined), location.updateMode ?? UpdateMode.FromCode, false);
        });
    }
    
    public initializeBoot(): void {
        this.subscribe();
    }

    public setLocationFromNavigator(to: HistoryTo): void {
        let locationTo: Path;
        if (typeof to === "string") {
            locationTo = new URL(to, window.location.href);
        } else if (typeof to === "object") {
            locationTo = {
                pathname: "",
                search: "",
                hash: "",
                ...to
            };
        } else {
            // don't know what to do
            return;
        }
        const currentLocation = this.stateValue.value.location
        if (
            ((currentLocation.pathname || "") === (locationTo.pathname || ""))
            && ((currentLocation.search || "") === (locationTo.search || ""))
            && ((currentLocation.hash || "") === (locationTo.hash || ""))
        ) {
            // skip href modification
        } else {
            this.suspressNavigator = true;
            this.history.push(to, undefined, UpdateMode.FromCode, false);
        }
    }

    public listenEventLocationChanged(msg: string, callback: DSEventHandler<LocationChangedPayload, "locationChanged", "router">): DSUnlisten {
        return this.listenEvent<LocationChangedEvent>(msg, "locationChanged", callback);
    }

    historyListener(update: HistoryUpdate<LocationState>): DSEventHandlerResult {
        //console.warn("historyListener", this.suspressNavigator, update);
        const suspressNavigator = this.suspressNavigator;
        this.suspressNavigator = false;
        const locationPC = getPropertiesChanged(this.stateValue);
        locationPC.setIf("action", update.action || "PUSH");
        locationPC.setIf("location", injectQuery(update.location));
        locationPC.setIf("updateMode", update.updateMode);
        locationPC.valueChangedIfNeeded("historyListener");
        if (suspressNavigator) {
            // may be changed but ignore it
            dsLog.debugACME("DS", "DSRouterStore", "historyListener", update.location.pathname, "suspressNavigator")
        } else {
            const p = routerLocationChanged.emitEvent(this.stateValue.value);
            if (p && typeof p.then === "function") {
                return catchLog("routerLocationChanged", p);
            }
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
