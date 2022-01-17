import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog
} from 'dependingState';

import AppView from './component/App/AppView';
import { AppStoreManager } from './store/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { PageAStore } from './component/PageA/PageAStore';
import { AppViewValue } from './component/App/AppViewValue';
import { AppViewStore } from './component/App/AppViewStore';
import { AppState, AppStore } from './store/AppState';
//import { Project } from './types';

function main() {
    dsLog.setAppStoreManagerInWindow();
    dsLog.setEnabled();
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

    dsLog.setWatchout("DS", "DSStoreManager", "processEvent-Event-skip")
    dsLog.saveToLocalStorage()
    */
    if (dsLog.enabled){
        dsLog.info("main()");
    }
    const RouterStore=new RouterStore();
    const pageAStore = new PageAStore();
    const appStore=new AppStore(new AppState());
    const appViewStore = new AppViewStore(new AppViewValue());
    const appStoreManager = new AppStoreManager(
        appStore,
        appViewStore,
        pageAStore
        );
    setAppStoreManager(appStoreManager);
    appStoreManager.setAppStoreManagerInWindow();
    
    const rootElement = React.createElement(
            AppView,
            appStoreManager.appViewStore.stateValue.getViewProps()
        );
    const appRootElement = window.document.getElementById("appRoot");
    if (appRootElement) {
        ReactDom.render(rootElement, appRootElement);
    } else {
        console.error("'appRoot' not defined.");
    }

    setTimeout(() => {
        appStore.stateValue.language= "HALLO";
        appStore.stateValue.valueChanged();
    }, 1000);

}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
