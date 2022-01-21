import React from 'react';
import ReactDom from 'react-dom';

import {
    dsLog
} from 'dependingState';

import { AppStoreManager } from './store/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { AppUIValue } from './component/AppUI/AppUIValue';
import { AppUIStore } from './component/AppUI/AppUIStore';

import AppView from './component/AppUI/AppUIView';

function main() {
    // for debugging Browser F12 Console window.dsLog
    dsLog.initialize();
    // for easy now
    dsLog.setEnabled();

    /*
    dsLog.applyFromLocalStorage();
    dsLog.setEnabled();
    dsLog.setDisabled();
    */   
    if (dsLog.enabled){
        dsLog.info("main()");
    }

    // create all stores
    const appUIStore=new AppUIStore(new AppUIValue());

    // create appStoreManager
    const appStoreManager = new AppStoreManager(
        appUIStore
        );
    setAppStoreManager(appStoreManager);
    dsLog.attach(appStoreManager);
    appStoreManager.initialize();

    // start React
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
