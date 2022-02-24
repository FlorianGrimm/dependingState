import React from 'react';
import ReactDom from 'react-dom';

import {
    dsLog
} from 'dependingState';

import AppView from './components/AppUI/AppUIView';
import { AppStoreManager } from './services/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { CalculatorStore } from './components/Calculator/CalculatorStore';
import { AppUIValue } from './components/AppUI/AppUIValue';
import { AppUIStore } from './components/AppUI/AppUIStore';
import { AppState, AppStore } from './services/AppState';
import { CalculatorStyleStore } from './components/CalculatorStyle/CalculatorStyleStore';

function main() {
    // for debugging Browser F12 Console window.dsLog
    dsLog.initialize("enabled");

    if (dsLog.enabled) {
        dsLog.info("main()");
    }
    const appStore = new AppStore(new AppState());
    const appUIStore = new AppUIStore(new AppUIValue());
    const calculatorStyleStore = new CalculatorStyleStore();
    const calculatorStore = new CalculatorStore();
    const appStoreManager = new AppStoreManager(
        appStore,
        appUIStore,
        calculatorStore,
        calculatorStyleStore
    );
    setAppStoreManager(appStoreManager);
    appStoreManager.setSelfInGlobal();
    appStoreManager.enableTiming = true;
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
