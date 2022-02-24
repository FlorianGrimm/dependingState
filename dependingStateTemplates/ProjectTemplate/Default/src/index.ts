import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog, DSStateValue,
} from 'dependingState';

import AppUIView from './components/AppUI/AppUIView';
import { AppStoreManager } from './services/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { PageAStore } from './components/PageA/PageAStore';
import { AppUIValue } from './components/AppUI/AppUIValue';
import { AppUIStore } from './components/AppUI/AppUIStore';
import { PageBStore } from './components/PageB/PageBStore';
import { createBrowserHistory, DSRouterStore, DSRouterValue, getDSRouterValueInitial } from 'dependingStateRouter';
import { NavigatorStore } from './components/Navigator/NavigatorStore';
import { NavigatorValue } from './components/Navigator/NavigatorValue';

function main() {
     // initialize log
     dsLog.initialize();

     // remove this if going productive
     dsLog.setEnabled();
 
     if (dsLog.enabled){
         dsLog.info("__Name__ main()");
     }
 
     // create all stores
    const routerStore = new DSRouterStore<DSRouterValue>(createBrowserHistory(), getDSRouterValueInitial());
    const navigatorStore = new NavigatorStore(new DSStateValue<NavigatorValue>({ page: "home", pathName: "", pathArguments: {}, isExact: false }));
    navigatorStore.setRouter(routerStore);
    const pageAStore = new PageAStore();
    const pageBStore = new PageBStore();
    const appUIStore = new AppUIStore(new AppUIValue());

    // create appStoreManager
    const appStoreManager = new AppStoreManager(
        routerStore,
        navigatorStore,
        appUIStore,
        pageAStore,
        pageBStore
    );
    setAppStoreManager(appStoreManager);
    dsLog.attach(appStoreManager);
    appStoreManager.initialize();

    // start React
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
