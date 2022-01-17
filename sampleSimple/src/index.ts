import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog
} from 'dependingState';

import AppView from './component/App/AppView';
import { AppStoreManager } from './store/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { CalculatorStore } from './component/Calculator/CalculatorStore';
import { AppViewValue } from './component/App/AppViewValue';
import { AppViewStore } from './component/App/AppViewStore';
import { AppState, AppStore } from './store/AppState';
//import { Project } from './types';

function main() {
    // for debugging Browser F12 Console window.dsLog
    dsLog.setAppStoreManagerInWindow();
    dsLog.setEnabled();
    /*
    dsLog.applyFromLocalStorage();
    dsLog.setEnabled();
    dsLog.setDisabled();
    */
    
    if (dsLog.enabled){
        dsLog.info("main()");
    }
    const calculatorStore = new CalculatorStore();
    const appStore=new AppStore(new AppState());
    const appViewStore = new AppViewStore(new AppViewValue());
    const appStoreManager = new AppStoreManager(
        appStore,
        appViewStore,
        calculatorStore
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
}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
