import {
    ConfigurationDSValueStore,
    DSEventHandlerResult,
    DSStateValue
} from "dependingState";

import {
    DSNavigatorStore,
    LocationChangedPayload,
    match,
    NavigatorSetLocationPayload,
    RouterLocation
} from "dependingStateRouter";

import {
    NavigatorPageName,
    NavigatorPaths,
    NavigatorRoutes,
    NavigatorPathArguments,
    NavigatorPathName,
    NavigatorValue,
    NavigatorPages,
    NavigatorPatterns
} from "./NavigatorValue";


export class NavigatorStore extends DSNavigatorStore<NavigatorValue, NavigatorPageName, NavigatorPathArguments, "navigator"> {
    pathNames: NavigatorPathName[];
    path: NavigatorPaths;
    route: NavigatorRoutes;
    pages: NavigatorPages;
    patterns: NavigatorPatterns;

    constructor(
        stateValue: NavigatorStore['stateValue'],
        configuration?: ConfigurationDSValueStore<NavigatorStore['stateValue']['value']>
    ) {
        super(
            "navigator",
            stateValue,
            configuration
        );

        this.pathNames = ["home", "pageA", "pageB"];

        const path: NavigatorPaths = this.path = {
            home: "/",
            pageA: "/pageA",
            pageB: ["/pageB", "/pageB/:id"],
        };

        this.patterns = {
            home: path.home,
            pageA: path.pageA,
            pageB: path.pageB[1],
        };

        this.route = {
            home: {
                path: this.path.home,
                exact: true
            },
            pageA: {
                path: this.path.pageA
            },
            pageB: {
                path: this.path.pageB
            },
        };

        this.pages = {
            "home": "home",
            "pageA": "pageA",
            "pageB": "pageB",
        }


    }

    /** called if push or replace was called */
    handleLocationChanged(payload: LocationChangedPayload): DSEventHandlerResult {
        const { action, location, updateMode } = payload;
        {
            const result = this.matchPaths(location);
            if (result !== null) {
                const [pathName,m] = result;
                /*
                if (pathName==="pageB")
                */
                this.stateValue.value = {
                    page: this.pages[pathName],
                    pathArguments: m.params,
                    isExact: m.isExact,
                    pathName: pathName
                };
            } else {
                this.stateValue.value = {
                    page: "pageError",
                    pathArguments: {},
                    isExact: false,
                    pathName: ""
                };
            }

        }

    }

    matchPaths(location: RouterLocation<unknown>): [NavigatorPathName, match<{}>] | null {
        for (const pathName of this.pathNames) {
            const m = this.matchPath(location.pathname, this.route[pathName]);
            if (m) {
                return [pathName, m];
            }
        }
        return null;
    }

    convertTo<Payload extends NavigatorSetLocationPayload<NavigatorPageName, NavigatorPathArguments>>(payload: Payload): Payload {
        // payload.page
        return payload;
    }
}
