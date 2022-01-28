import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog, DSStateValue,
} from 'dependingState';

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
    // initialize log
    dsLog.initialize("enabled");
    dsLog.enableTiming=true;
    if (dsLog.enabled){
        dsLog.info("main()");
    }

    // create all stores
    const routerStore = new DSRouterStore<DSRouterValue>(createBrowserHistory(), getDSRouterValueInitial());
    const navigatorStore = new NavigatorStore(new DSStateValue<NavigatorValue>({ page: "home", pathArguments: {} }));
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
    dsLog.attach(appStoreManager);    
    appStoreManager.enableTiming=true;
    appStoreManager.initialize();
    appStoreManager.warnEventsOutOfProcess=false;

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
