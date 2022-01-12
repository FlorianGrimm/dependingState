import React from 'react';
import ReactDom from 'react-dom';

import {
    DSEvent,
    DSEventAttach,
    DSEventValue,
    DSPayloadEntity,
    DSReactContext,
    DSStateValue
} from 'dependingState';

import AppView, { AppViewStateValue, AppViewStore } from './component/App/AppView';
import { AppStoreManager } from './store/AppStoreManager';
import { ProjectStore } from './store/ProjectStore';
import { setAppStoreManager } from './singletonAppStoreManager';
import { Project } from './types';
import { CompAUIState, CompAUIStore } from './component/CompA/CompA';
import { AppViewProjectsUIStateValue, AppViewProjectsUIStore } from './component/App/AppViewProjects';
import { AppState, AppStore } from './store/AppState';
import { dsLog } from '../../dependingState/src/DSLog';

function main() {
    dsLog.info("main()");
    dsLog.enabled=true;
    const projectStore = new ProjectStore();
    const compAUIStore = new CompAUIStore();
    const appState=new AppStore(new AppState());
    const appViewStore = new AppViewStore(new AppViewStateValue());
    const appViewProjectsUIStateValue=new AppViewProjectsUIStateValue();
    const appViewProjectsUIStore = new AppViewProjectsUIStore(appViewProjectsUIStateValue);
    const appStoreManager = new AppStoreManager(
        appState,
        projectStore,
        appViewStore,
        compAUIStore,
        appViewProjectsUIStore);
    const dsReactContext = new DSReactContext(appStoreManager);

    setAppStoreManager(appStoreManager);

    (window as any).appStoreManager = appStoreManager;

    appStoreManager.projectStore.set({ ProjectId: "1", ProjectName: "one" });
    appStoreManager.projectStore.set({ ProjectId: "2", ProjectName: "two" });
    appStoreManager.projectStore.set({ ProjectId: "3", ProjectName: "three" });
    appStoreManager.process();
    
    const rootElement = React.createElement(
        dsReactContext.context.Provider, { value: dsReactContext.storeManager },
        React.createElement(
            AppView,
            appStoreManager.appViewStore.stateValue.getViewProps()
        ));
    const appRootElement = window.document.getElementById("appRoot");
    if (appRootElement) {
        ReactDom.render(rootElement, appRootElement);
    } else {
        console.error("'appRoot' not defined.");
    }

    setTimeout(() => {
        appState.stateValue.language= "HALLO";
        appState.stateValue.valueChanged();
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
