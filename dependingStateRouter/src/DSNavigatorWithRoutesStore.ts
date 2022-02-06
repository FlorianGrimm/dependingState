import {
    ConfigurationDSValueStore,
    DSEventHandlerResult,
    IDSStateValue,
    deepEquals,
    getPropertiesChanged,
} from "dependingState";

import {
    ConvertPageParametersResult,
    IDSNavigatorValue,
    match,
    PathArgumentsAny,
    PathArgumentsString,
    RouteDefinition,
    RouterLocation
} from "./types";

import { LocationChangedPayload } from './DSRouterAction';
import { DSNavigatorStore } from "./DSNavigatorStore";
import { UpdateMode } from "./history";

export class DSNavigatorWithRoutesStore<
    Value extends IDSNavigatorValue<NavigatorPageName, NavigatorPathArguments>,
    RoutesDef extends {
        [K in NavigatorPageName]: RouteDefinition;
    },
    NavigatorPageName extends string = Value['page'],
    NavigatorPathArguments extends {} = Value['pathArguments'],
    StoreName extends string = string
    > extends DSNavigatorStore<Value, NavigatorPageName, NavigatorPathArguments, StoreName>{

    pageNames: NavigatorPageName[];
    pageRouteNotFound: NavigatorPageName;
    routes: RoutesDef;

    constructor(
        pageNames: NavigatorPageName[],
        pageRouteNotFound: NavigatorPageName,
        routes: RoutesDef,
        storeName: StoreName,
        stateValue: IDSStateValue<Value>,
        configuration?: ConfigurationDSValueStore<Value>
    ) {
        super(storeName, stateValue, configuration);
        // already done in super: navigatorWithRoutesBuilder.bindValueStore(this);
        this.pageNames = pageNames;
        this.pageRouteNotFound = pageRouteNotFound;
        this.routes = routes;
    }

    matchPaths(location: RouterLocation<unknown>): [NavigatorPageName, match<{}>] | null {
        for (const pageName of this.pageNames) {
            const m = this.matchPath(location.pathname, this.routes[pageName]);
            if (m) {
                return [pageName, m];
            }
        }
        return null;
    }


    /** called if push or replace was called */
    handleLocationChanged(payload: LocationChangedPayload): DSEventHandlerResult {
        const { action, location, updateMode } = payload;
        {
            const result = this.matchPaths(location);
            if (result !== null) {
                const { pageName, pathArguments } = this.convertPageParameters(result[0], result[1], action, location, updateMode);
                this.setPagePathArguments(pageName, pathArguments);
            } else {
                this.setPagePathArguments(this.pageRouteNotFound, {} as any);
            }
        }
    }

    setPagePathArguments(pageName: NavigatorPageName, pathArguments: Value['pathArguments']) {
        const pc = getPropertiesChanged(this.stateValue);
        this.stateValue.value.pathArguments
        pc.setIf("page", pageName);
        pc.setIf("pathArguments", pathArguments, deepEquals);
        pc.valueChangedIfNeeded("handleLocationChanged");
    }

    convertPageParameters(
        pageName: NavigatorPageName,
        m: match<any>,
        action: string,
        location: RouterLocation<unknown>,
        updateMode: UpdateMode
    ): ConvertPageParametersResult<NavigatorPageName, Value['pathArguments']> {
        return { pageName, pathArguments: m.params as any };
    }
}