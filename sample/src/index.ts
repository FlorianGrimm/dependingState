import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog
} from 'dependingState';

import AppView, { AppViewStateValue, AppViewStore } from './component/App/AppView';
import { AppStoreManager } from './store/AppStoreManager';
import { ProjectStore } from './store/ProjectStore';
import { setAppStoreManager } from './singletonAppStoreManager';
import { CompAStore } from './component/CompA/CompAStore';
import { AppViewProjectsUIStateValue } from './component/App/AppViewProjectsUIStateValue';
import { AppViewProjectsUIStore } from './component/App/AppViewProjectsUIStore';
import { AppState, AppStore } from './store/AppState';
//import { Project } from './types';

function main() {
    dsLog.setAppStoreManagerInWindow();
    dsLog.applyFromLocalStorage();

    /*
    dsLog.setEnabled();
    dsLog.saveToLocalStorage()
    dsLog.setWatchout("DS", "DSUIStateValue", "triggerUIUpdate", "AppViewProjects", 2);
    dsLog.setWatchout("DS", "DSStateValue", "stateVersion", "CompAValue", 5);
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
    const projectStore = new ProjectStore();
    const compAStore = new CompAStore();
    const appStore=new AppStore(new AppState());
    const appViewStore = new AppViewStore(new AppViewStateValue());
    const appViewProjectsUIStore = new AppViewProjectsUIStore(new AppViewProjectsUIStateValue());
    const appStoreManager = new AppStoreManager(
        appStore,
        projectStore,
        appViewStore,
        compAStore,
        appViewProjectsUIStore);
    setAppStoreManager(appStoreManager);
    appStoreManager.setAppStoreManagerInWindow();

    appStoreManager.projectStore.set({ ProjectId: "1", ProjectName: "one" });
    appStoreManager.projectStore.set({ ProjectId: "2", ProjectName: "two" });
    appStoreManager.projectStore.set({ ProjectId: "3", ProjectName: "three" });
    appStoreManager.process();
    
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

    setTimeout(() => {
        const prj = projectStore.get("1");
        if (prj) {
            prj.value.ProjectName = "one - part 2";
            prj.valueChanged();
        }
    }, 5000);
}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
