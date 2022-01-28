import {
    ConfigurationDSValueStore,
    // DSEventHandlerResult,
    // getPropertiesChanged,
    // deepEquals,
} from "dependingState";

import {
    ConvertPageParametersResult,
    DSNavigatorWithRoutesStore,
    IDSNavigatorValue,
    match,
    PathArgumentsString,
    RouteDefinition,
    RouterLocation,
    UpdateMode,
    // DSNavigatorStore,
    // LocationChangedPayload,
    // NavigatorSetLocationPayload,
    // PathArgumentsAny,
} from "dependingStateRouter";
import { appNavigatorSetLocation } from "./NavigatorActions";
import { NavigatorPages } from "./NavigatorValue";

// import {
//     NavigatorPageName,
//     NavigatorPaths,
//     NavigatorRoutes,
//     NavigatorPathArguments,
//     NavigatorPathKey as NavigatorPathKey,
//     NavigatorValue,
//     NavigatorPages,
//     NavigatorPatterns,
//     defRoutes,
//     arrPathKey
// } from "./NavigatorValue";


// export class NavigatorStore extends DSNavigatorStore<NavigatorValue, NavigatorPageName, NavigatorPathArguments, "navigator"> {
//     arrPathKey: NavigatorPathKey[];
//     // mapPaths: NavigatorPaths;
//     //routes: NavigatorRoutes;
//     routes: typeof defRoutes;
//     // mapPage2Path: NavigatorPages;
//     // mapPatterns: NavigatorPatterns;

//     constructor(
//         stateValue: NavigatorStore['stateValue'],
//         configuration?: ConfigurationDSValueStore<NavigatorStore['stateValue']['value']>
//     ) {
//         super(
//             "navigator",
//             stateValue,
//             configuration
//         );
//         this.arrPathKey = arrPathKey;
//         this.routes = defRoutes;

//         /*
//         this.arrPathKey = [
//             "home",
//             "pageA",
//             "pageB",
//             "pageBId",
//             "pageC",
//             "pageD"
//         ];

//         const path: NavigatorPaths = this.mapPaths = {
//             home: "/",
//             pageA: "/pageA",
//             pageB: ["/pageB", "/pageB/:id"],
//             pageC: ["/pageC", "/pageD"]
//         };

//         this.mapPatterns = {
//             home: path.home,
//             pageA: path.pageA,
//             pageB: [path.pageB, path.pageBId,
//             pageC: path.pageC,
//             pageD: path.pageD
//         };


//         this.mapPage2Path = {
//             "home": "home",
//             "pageA": "pageA",
//             "pageB": "pageB",
//             "pageC": "pageB",
//         }
//         */


//     }

//     /** called if push or replace was called */
//     handleLocationChanged(payload: LocationChangedPayload): DSEventHandlerResult {
//         const { action, location, updateMode } = payload;
//         {
//             const result = this.matchPaths(location);
//             if (result !== null) {
//                 const [pathKey, m] = result;
//                 // HERE
//                 /*
//                 if (pathName==="pageB")
//                 */
//                 //this.mapPath2PathKey.get(m.path)

//                 // const v = {
//                 //     page: pathKey,
//                 //     pathArguments: m.params,
//                 //     // isExact: m.isExact || false,
//                 //     // pathPattern: m.path,
//                 //     // to: m.url
//                 // };
//                 // if (!deepEquals(this.stateValue.value, v)) {
//                 //     this.stateValue.value = v;
//                 // }

//                 const pc = getPropertiesChanged(this.stateValue);
//                 pc.setIf("page", pathKey);
//                 pc.setIf("pathArguments", m.params, deepEquals);
//                 pc.valueChangedIfNeeded("handleLocationChanged");

//                 //pc.setIf("page", this.pages[pathName]);
//                 // pc.setIf("pathArguments", m.params, deepEquals);
//                 // pc.setIf("isExact", m.isExact || false);
//                 // pc.setIf("pathName", pathName || "");

//             } else {
//                 this.stateValue.value = {
//                     page: "pageError",
//                     pathArguments: {},
//                     // isExact: false,
//                     // pathPattern: ""
//                 };
//             }

//         }

//     }

//     matchPaths(location: RouterLocation<unknown>): [NavigatorPathKey, match<{}>] | null {
//         for (const pathKey of this.arrPathKey) {
//             const m = this.matchPath(location.pathname, this.routes[pathKey]);
//             if (m) {
//                 return [pathKey, m];
//             }
//         }
//         return null;
//     }

//     convertTo<Payload extends NavigatorSetLocationPayload<NavigatorPageName, NavigatorPathArguments>>(payload: Payload): Payload {
//         // payload.page
//         console.log("convertTo", payload);

//         // payload.to = {
//         //     pathname
//         // };
//         return payload;
//     }

//     navigateHome() {
//         appNavigatorSetLocation.emitEvent({ page: "home", to: "/", pathArguments: {} });
//     }
//     navigateToPageA(payload: string) {
//         //appNavigatorSetLocation.emitEvent({ page: "pageA", to: this.mapPaths.pageA[0], pathArguments: {}, pathName: "pageA", isExact: true });
//         appNavigatorSetLocation.emitEvent({ page: "pageA", pathArguments: {}, to: this.routes.pageA.path as string });
//     }
//     navigateToPageB(payload: string) {
//         //appNavigatorSetLocation.emitEvent({ page: "pageB", to: this.mapPaths.pageB[0], pathArguments: {}, pathName: "pageB", isExact: true });
//         appNavigatorSetLocation.emitEvent({ page: "pageB", pathArguments: {}, to: this.routes.pageB.path[0] });
//     }
// }


type RoutesDef = typeof defRoutes2;
type NavigatorPageName = keyof RoutesDef;
/* extends {
    [K in NavigatorPageName]: RouteDefinition;
},
*/


export type NavigatorPathArguments = {};
export type NavigatorValue = IDSNavigatorValue<NavigatorPageName, NavigatorPathArguments>;

export class NavigatorStore extends DSNavigatorWithRoutesStore<
    NavigatorValue,
    RoutesDef,
    NavigatorPageName,
    NavigatorPathArguments,
    "navigator">{

    constructor(
        stateValue: NavigatorStore['stateValue'],
        configuration?: ConfigurationDSValueStore<NavigatorStore['stateValue']['value']>
    ) {
        super(
            defPageNames,
            "pageError",
            defRoutes2,
            "navigator",
            stateValue,
            configuration
        );
    }

    convertPageParameters(
        pageName: NavigatorPageName,
        m: match<any>,
        action: string,
        location: RouterLocation<unknown>,
        updateMode: UpdateMode
    ): ConvertPageParametersResult<NavigatorPageName> {
        const { params:pathArguments } = m;
        if (pageName === "pageA") {
            console.log("pageA",m);
            const { a = "0", b = "0" } = pathArguments;
            return { pageName, pathArguments: { a:Number.parseInt(a), b:Number.parseInt(b) } };
        }
        if (pageName === "pageB") {
            console.log("pageA",m);
            const { a = "0", b = "0" } = pathArguments;
            return { pageName, pathArguments: { a:Number.parseInt(a), b:Number.parseInt(b) } };

        }
        return { pageName, pathArguments: {} };
    }

    navigateHome() {
        appNavigatorSetLocation.emitEvent({ page: "home", to: "/", pathArguments: {} });
    }

    navigateToPageA(payload: {a:number, b:number}|undefined) {
        //appNavigatorSetLocation.emitEvent({ page: "pageA", to: this.mapPaths.pageA[0], pathArguments: {}, pathName: "pageA", isExact: true });
        appNavigatorSetLocation.emitEvent({ page: "pageA", pathArguments: {}, to: this.routes.pageA.path[0] });
    }

    navigateToPageB(payload: {a:number, b:number}|undefined) {
        //appNavigatorSetLocation.emitEvent({ page: "pageB", to: this.mapPaths.pageB[0], pathArguments: {}, pathName: "pageB", isExact: true });
        appNavigatorSetLocation.emitEvent({ page: "pageB", pathArguments: {}, to: this.routes.pageB.path[0] });
    }
}

const defPageNames: (keyof typeof defRoutes2)[] = [
    "home",
    "pageA",
    "pageB",
    "pageC",
    "pageError"
];
const defRoutes2 = {
    home: <RouteDefinition>{
        path: "/",
        exact: true,
        //to:"/"
    },
    pageA: {
        path: ["/pageA", "/pageA/:a/:b"]
    },
    pageB: {
        path: ["/pageB", "/pageB/:a/:b"]
    },
    pageC: {
        path: ["/pageC1", "/pageC2"]
    },
    pageError: {
        path: "/pageError"
    },
};