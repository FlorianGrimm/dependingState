import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog,
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
import { AppState, AppStore } from './store/AppState';
import { RouterStore } from './component/Router/RouterStore';
import { PageBStore } from './component/PageB/PageBStore';

function main() {
    dsLog.setSelfInGlobal();
    appLog.setSelfInGlobal();
    dsLog.setMode("enabled");
    appLog.setMode("enabled");
    /*
    dsLog.applyFromLocalStorage();
    dsLog.setEnabled();
    dsLog.setDisabled();
    */
    /*
    dsLog.setEnabled();
    dsLog.saveToLocalStorage()

    dsLog.setWatchout("DS", "DSUIStateValue", "triggerUIUpdate", "AppViewProjects", 2);
    dsLog.setWatchout("DS", "DSStateValue", "stateVersion", "PageAValue", 5);
    dsLog.saveToLocalStorage()
    
    dsLog.setWatchout()
    dsLog.setEnabled();

    dsLog.clearFromLocalStorage()
    dsLog.saveToLocalStorage()
    */
    if (dsLog.enabled) {
        dsLog.info("main()");
    }
    const routerStore = new RouterStore();
    const pageAStore = new PageAStore();
    const pageBStore = new PageBStore();
    const appStore = new AppStore(new AppState());
    const appUIStore = new AppUIStore(new AppUIValue());
    const appStoreManager = new AppStoreManager(
        routerStore,
        appStore,
        appUIStore,
        pageAStore,
        pageBStore
    );
    setAppStoreManager(appStoreManager);
    appStoreManager.setSelfInGlobal();
    appStoreManager.process("boot",()=>{});
    
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
