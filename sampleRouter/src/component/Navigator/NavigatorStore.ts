import {
    ConfigurationDSValueStore,
    DSEventHandlerResult,
    getPropertiesChanged,
    deepEquals,
} from "dependingState";

import {
    DSNavigatorStore,
    LocationChangedPayload,
    match,
    NavigatorSetLocationPayload,
    RouterLocation
} from "dependingStateRouter";
import { appNavigatorSetLocation } from "./NavigatorActions";

import {
    NavigatorPageName,
    NavigatorPaths,
    NavigatorRoutes,
    NavigatorPathArguments,
    NavigatorPathKey as NavigatorPathKey,
    NavigatorValue,
    NavigatorPages,
    NavigatorPatterns,
    routes,
    arrPathKey
} from "./NavigatorValue";


export class NavigatorStore extends DSNavigatorStore<NavigatorValue, NavigatorPageName, NavigatorPathArguments, "navigator"> {
    arrPathKey: NavigatorPathKey[];
    // mapPaths: NavigatorPaths;
    routes: NavigatorRoutes;
    // mapPage2Path: NavigatorPages;
    // mapPatterns: NavigatorPatterns;

    constructor(
        stateValue: NavigatorStore['stateValue'],
        configuration?: ConfigurationDSValueStore<NavigatorStore['stateValue']['value']>
    ) {
        super(
            "navigator",
            stateValue,
            configuration
        );
        this.arrPathKey = arrPathKey;
        this.routes = routes;
       
        /*
        this.arrPathKey = [
            "home",
            "pageA",
            "pageB",
            "pageBId",
            "pageC",
            "pageD"
        ];

        const path: NavigatorPaths = this.mapPaths = {
            home: "/",
            pageA: "/pageA",
            pageB: ["/pageB", "/pageB/:id"],
            pageC: ["/pageC", "/pageD"]
        };

        this.mapPatterns = {
            home: path.home,
            pageA: path.pageA,
            pageB: [path.pageB, path.pageBId,
            pageC: path.pageC,
            pageD: path.pageD
        };

        this.route = {
            home: {
                path: this.mapPaths.home,
                exact: true
            },
            pageA: {
                path: this.mapPaths.pageA
            },
            pageB: {
                path: this.mapPaths.pageB
            },
            pageBId:{
                path: this.mapPaths.pageBId
            },
            pageC: {
                path: this.mapPaths.pageC
            },
            pageD: {
                path: this.mapPaths.pageD
            }
        };

        this.mapPage2Path = {
            "home": "home",
            "pageA": "pageA",
            "pageB": "pageB",
            "pageC": "pageB",
        }
        */


    }

    /** called if push or replace was called */
    handleLocationChanged(payload: LocationChangedPayload): DSEventHandlerResult {
        const { action, location, updateMode } = payload;
        {
            const result = this.matchPaths(location);
            if (result !== null) {
                const [pathKey, m] = result;
                // HERE
                /*
                if (pathName==="pageB")
                */
                //this.mapPath2PathKey.get(m.path)

                // const v = {
                //     page: pathKey,
                //     pathArguments: m.params,
                //     // isExact: m.isExact || false,
                //     // pathPattern: m.path,
                //     // to: m.url
                // };
                // if (!deepEquals(this.stateValue.value, v)) {
                //     this.stateValue.value = v;
                // }

                const pc = getPropertiesChanged(this.stateValue);
                pc.setIf("page", pathKey);
                pc.setIf("pathArguments", m.params, deepEquals);
                pc.valueChangedIfNeeded("handleLocationChanged");

                //pc.setIf("page", this.pages[pathName]);
                // pc.setIf("pathArguments", m.params, deepEquals);
                // pc.setIf("isExact", m.isExact || false);
                // pc.setIf("pathName", pathName || "");

            } else {
                this.stateValue.value = {
                    page: "pageError",
                    pathArguments: {},
                    // isExact: false,
                    // pathPattern: ""
                };
            }

        }

    }

    matchPaths(location: RouterLocation<unknown>): [NavigatorPathKey, match<{}>] | null {
        for (const pathKey of this.arrPathKey) {
            const m = this.matchPath(location.pathname, this.routes[pathKey]);
            if (m) {
                return [pathKey, m];
            }
        }
        return null;
    }

    convertTo<Payload extends NavigatorSetLocationPayload<NavigatorPageName, NavigatorPathArguments>>(payload: Payload): Payload {
        // payload.page
        console.log("convertTo", payload);

        // payload.to = {
        //     pathname
        // };
        return payload;
    }

    navigateToPageA(payload: string) {
        //appNavigatorSetLocation.emitEvent({ page: "pageA", to: this.mapPaths.pageA[0], pathArguments: {}, pathName: "pageA", isExact: true });
        appNavigatorSetLocation.emitEvent({ page: "pageA",  pathArguments: {}, to: this.routes.pageA.path! as string });
    }
    navigateToPageB(payload: string) {
        //appNavigatorSetLocation.emitEvent({ page: "pageB", to: this.mapPaths.pageB[0], pathArguments: {}, pathName: "pageB", isExact: true });
        appNavigatorSetLocation.emitEvent({ page: "pageB",pathArguments: {}, to: this.routes.pageB.path![0] });
    }
}
