import { IDSNavigatorValue, RouteDefinition } from "dependingStateRouter";

export const mapPath = {
    home: "/",
    pageA: "/pageA",
    pageB: ["/pageB", "/pageB/:id"],
    pageC: ["/pageC", "/pageD"]
};

export type NavigatorPaths = typeof mapPath;

export type NavigatorPaths2 = {
    home: string;
    pageA: string;
    pageB: string[];
    pageC: string[];
};

export const arrPathKey: NavigatorPathKey[] = [
    "home",
    "pageA",
    "pageB",
    "pageC",
];

//export const routes: NavigatorRoutes = {
export const defRoutes = {
    home: {
        path: mapPath.home,
        exact: true
    },
    pageA: {
        path: mapPath.pageA
    },
    pageB: {
        path: mapPath.pageB
    },
    pageC: {
        path: mapPath.pageC
    },
};


export type NavigatorPathKey = (keyof NavigatorPaths);
export type NavigatorPageName = NavigatorPathKey | "pageError";

export type NavigatorPages = {
    [K in NavigatorPathKey]: NavigatorPageName;
};
export type NavigatorRoutes = {
    [K in NavigatorPathKey]: RouteDefinition;
};

export type NavigatorPatterns = {
    [K in NavigatorPathKey]: string;
};

export type NavigatorPathArguments = {};
export type NavigatorValue = IDSNavigatorValue<NavigatorPageName, NavigatorPathArguments>;




// export const mapPatterns = {
//     home: mapPath.home,
//     pageA: mapPath.pageA,
//     pageB: mapPath.pageB[0],
//     pageC: mapPath.pageC[0],
// };


// this.mapPage2Path = {
//     "home": "home",
//     "pageA": "pageA",
//     "pageB": "pageB",
//     "pageC": "pageB",
// }
