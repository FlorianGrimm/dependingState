import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog
} from 'dependingState';

import AppView from './component/AppUI/AppUIView';
import { AppStoreManager } from './store/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { AppUIValue } from './component/AppUI/AppUIValue';
import { AppUIStore } from './component/AppUI/AppUIStore';
import { AppState, AppStore } from './store/AppState';

function main() {
    // for debugging Browser F12 Console window.dsLog
    dsLog.setSelfInGlobal();
    dsLog.setMode("enabled");
    /*
    dsLog.applyFromLocalStorage();
    dsLog.setEnabled();
    dsLog.setDisabled();
    */
    
    if (dsLog.enabled){
        dsLog.info("main()");
    }
    const appStore=new AppStore(new AppState());
    const appUIStore=new AppUIStore(new AppUIValue());
    const appStoreManager = new AppStoreManager(
        appStore,
        appUIStore
        );
    setAppStoreManager(appStoreManager);
    appStoreManager.setSelfInGlobal();
    appStoreManager.enableTiming=true;
    appStoreManager.initialize();

    const rootElement = React.createElement(
            AppView,
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
