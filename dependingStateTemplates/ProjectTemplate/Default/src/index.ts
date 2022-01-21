import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog, DSStateValue,
} from 'dependingState';
import {
    appLog
} from './feature/appLog/appLog';

import AppUIView from './component/AppUI/AppUIView';
import { AppStoreManager } from './store/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { PageAStore } from './component/PageA/PageAStore';
import { AppUIValue } from './component/AppUI/AppUIValue';
import { AppUIStore } from './component/AppUI/AppUIStore';
import { PageBStore } from './component/PageB/PageBStore';
import { createBrowserHistory, DSRouterStore, DSRouterValue, getDSRouterValueInitial } from 'dependingStateRouter';
import { NavigatorStore } from './component/Navigator/NavigatorStore';
import { NavigatorValue } from './component/Navigator/NavigatorValue';

function main() {
    /* productive
    dsLog.applyFromLocalStorage();
    appLog.applyFromLocalStorage();
    */
    /* development */
    dsLog.setSelfInGlobal();
    appLog.setSelfInGlobal();
    dsLog.setMode("enabled");
    appLog.setMode("enabled");
    /* / development */

    if (dsLog.enabled) {
        dsLog.info("main()");
    }
    const routerStore = new DSRouterStore<DSRouterValue>(createBrowserHistory(), getDSRouterValueInitial());
    const navigatorStore = new NavigatorStore(new DSStateValue<NavigatorValue>({ page: "home", pathName: "", pathArguments: {}, isExact: false }));
    navigatorStore.setRouter(routerStore);
    const pageAStore = new PageAStore();
    const pageBStore = new PageBStore();
    const appUIStore = new AppUIStore(new AppUIValue());
    const appStoreManager = new AppStoreManager(
        routerStore,
        navigatorStore,
        appUIStore,
        pageAStore,
        pageBStore
    );
    setAppStoreManager(appStoreManager);
    appStoreManager.setSelfInGlobal();
    appStoreManager.initialize();

    appStoreManager.process("boot", () => { });

    const rootElement = React.createElement(
        AppUIView,
        appStoreManager.appUIStore.stateValue.getViewProps()
    );
    const appRootElement = window.document.getElementById("appRoot");
    if (appRootElement) {
        ReactDom.render(rootElement, appRootElement);
    } else {
        console.error("'appRoot' not defined.");
    }
}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
