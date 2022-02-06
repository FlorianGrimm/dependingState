import { IDSNavigatorValue, RouteDefinition } from "dependingStateRouter";

export type RoutesDef = typeof defRoutes;
export type NavigatorPageName = keyof RoutesDef;

export type NavigatorPathArguments = {};
export type NavigatorValue = IDSNavigatorValue<NavigatorPageName, NavigatorPathArguments>;

export const defPageNames: (keyof typeof defRoutes)[] = [
    "home",
    "pageA",
    "pageB",
    "pageC",
    "pageError"
];

export const defRoutes = {
    home: <RouteDefinition>{
        path: "/",
        exact: true,
        //to:"/"
    },
    pageA: {
        path: ["/pageA", "/pageA/:a/:b"],
    },
    pageB: {
        path: ["/pageB", "/pageB/:a/:b"],
        createRef: [
            () => "/pageB",
            (a: number, b: number) => `/pageB/${a}/${b}`
        ]
    },
    pageC: {
        path: ["/pageC1", "/pageC2"]
    },
    pageError: {
        path: "/pageError"
    },
};
