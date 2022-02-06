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

import { 
    appNavigatorSetLocation,
    navigateToHome,
    navigateToPageA,
    navigateToPageB
} from "./NavigatorActions";

import {
    defPageNames,
    defRoutes,
    NavigatorPageName,
    NavigatorPathArguments,
    NavigatorValue,
    RoutesDef,
} from "./NavigatorValue";

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
            defRoutes,
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
        const { params: pathArguments } = m;
        if (pageName === "pageA") {
            // console.log("pageA", m);
            const { a = "0", b = "0" } = pathArguments;
            return { pageName, pathArguments: { a: Number.parseInt(a), b: Number.parseInt(b) } };
        }
        if (pageName === "pageB") {
            // console.log("pageA", m);
            const { a = "0", b = "0" } = pathArguments;
            return { pageName, pathArguments: { a: Number.parseInt(a), b: Number.parseInt(b) } };

        }
        return { pageName, pathArguments: {} };
    }

    public initializeStore(): void {
        super.initializeStore();
        //
        navigateToHome.listenEvent("navigateToHome", (e)=>{
            appNavigatorSetLocation.emitEvent({ page: "home", to: "/", pathArguments: {} });
        });
        //
        navigateToPageA.listenEvent("navigateToPageA", (e)=>{
            if (e.payload === undefined) {
                appNavigatorSetLocation.emitEvent({ page: "pageA", pathArguments: {}, to: "/pageA" });
            } else {
                const { a, b } = e.payload;
                appNavigatorSetLocation.emitEvent({ page: "pageA", pathArguments: {}, to: `/pageA/${a}/${b}` });
            }
            });
        //
        navigateToPageB.listenEvent("navigateToPageB", (e)=>{
            if (e.payload === undefined) {
                appNavigatorSetLocation.emitEvent({ page: "pageB", pathArguments: {}, to: "/pageB" });
            } else {
                const { a, b } = e.payload;
                appNavigatorSetLocation.emitEvent({ page: "pageB", pathArguments: {}, to: `/pageB/${a}/${b}` });
            }
            });
        //
    }
}
