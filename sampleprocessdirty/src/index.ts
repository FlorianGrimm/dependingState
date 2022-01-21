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
import { CounterStore } from './component/Counter/CounterStore';
import { CounterValue } from './component/Counter/CounterValue';
import { SumValue } from './component/Sum/SumValue';
import { SumStore } from './component/Sum/SumStore';

function main() {
    // initialize log
    dsLog.initialize();

    // remove this if going productive
    dsLog.setEnabled();

    if (dsLog.enabled) {
        dsLog.info("main()");
    }

    // create all stores
    const appUIStore = new AppUIStore(new AppUIValue());
    const counterStore = new CounterStore(new CounterValue());
    const sumStore = new SumStore(new SumValue());

    // create appStoreManager
    const appStoreManager = new AppStoreManager(
        appUIStore,
        counterStore,
        sumStore,
    );
    setAppStoreManager(appStoreManager);
    dsLog.attach(appStoreManager);
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


// hint 2
// in
// SumStore postAttached 
// add this 2 lines
// const counterStore = (this.storeManager! as IAppStoreManager).counterStore;
// counterStore.listenDirtyRelated(this.storeName, this);
