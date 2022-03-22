import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog, DSStateValue,
} from 'dependingState';

import AppUIView from './components/AppUI/AppUIView';
import { AppStoreManager } from './services/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { AppUIValue } from './components/AppUI/AppUIValue';
import { AppUIStore } from './components/AppUI/AppUIStore';

function main() {
    // initialize log
    dsLog.initialize();

    // remove this if going productive
    dsLog.setEnabled();

    if (dsLog.enabled) {
        dsLog.info("SampleStateVersion main()");
    }

    // create all stores
    const appUIStore = new AppUIStore(new AppUIValue());

    // create appStoreManager
    const appStoreManager = new AppStoreManager(
        appUIStore,
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
    console.error("Error while SampleStateVersion boots.", err);
}
