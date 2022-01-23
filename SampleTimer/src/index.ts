import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog, DSStateValue,
} from 'dependingState';

import { AppStoreManager } from './store/AppStoreManager';
import { setAppStoreManager } from './singletonAppStoreManager';
import { AppUIValue } from './component/AppUI/AppUIValue';
import { AppUIStore } from './component/AppUI/AppUIStore';
import { appUIView } from './component/AppUI/AppUIView';
import { timerStopGo } from './component/AppUI/AppUIActions';
import { TimerStore } from './component/Timer/TimerStore';

function main() {
     // initialize log
     dsLog.initialize();

     // remove this if going productive
     dsLog.setEnabled();
 
     if (dsLog.enabled){
         dsLog.info("SampleTimer main()");
     }
 
     // create all stores
    const appUIStore = new AppUIStore(new AppUIValue());
    const timerStore = new TimerStore();
    
    // create appStoreManager
    const appStoreManager = new AppStoreManager(
        appUIStore,
        timerStore,
    );
    setAppStoreManager(appStoreManager);
    dsLog.attach(appStoreManager);
    appStoreManager.initialize();

    timerStopGo.emitEvent(true);

    // start React
    const rootElement = appUIView(appStoreManager.appUIStore.stateValue.getViewProps());
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
