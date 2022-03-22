import React, { Fragment } from 'react';
import ReactDom from 'react-dom';

import {
    dsLog
} from 'dependingState';

import AppUIView from './components/AppUI/AppUIView';
import { AppStoreManager } from './services/AppStoreManager';
import { ProjectStore } from './services/ProjectStore';
import { setAppStoreManager } from './singletonAppStoreManager';
import { CompAStore } from './components/CompA/CompAStore';
import { AppViewProjectsUIStateValue } from './components/AppUIProjects/AppUIProjectsValue';
import { AppViewProjectsUIStore } from './components/AppUIProjects/AppUIProjectsStore';
import { AppState, AppStore } from './services/AppState';
import { appLog } from './feature/appLog/appLog';
import { AppUIStore } from './components/AppUI/AppUIStore';
import { AppUIValue } from './components/AppUI/AppUIValue';

function main() {
    dsLog.initialize("enabled");
    if (dsLog.enabled) {
        dsLog.info("main()");
    }
    dsLog.flags.add("triggerUIUpdate");

    const projectStore = new ProjectStore();
    const compAStore = new CompAStore();
    const appStore = new AppStore(new AppState());
    const appUIStore = new AppUIStore(new AppUIValue());
    const appViewProjectsUIStore = new AppViewProjectsUIStore(new AppViewProjectsUIStateValue());
    const appStoreManager = new AppStoreManager(
        appStore,
        projectStore,
        appUIStore,
        compAStore,
        appViewProjectsUIStore);
    setAppStoreManager(appStoreManager);
    dsLog.attach(appStoreManager);
    appStoreManager.initialize();

    appStoreManager.process("add first 3 projects", () => {
        appStoreManager.projectStore.set({ ProjectId: "1", ProjectName: "one" });
        appStoreManager.projectStore.set({ ProjectId: "2", ProjectName: "two" });
        appStoreManager.projectStore.set({ ProjectId: "3", ProjectName: "three" });
    });

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

    setTimeout(() => {
        appLog.logACME("app", "main", "timeoutHallo", "HALLO");
        appStore.stateValue.value.language = "HALLO";
        appStore.stateValue.valueChanged("HALLO");
    }, 1);

    setTimeout(() => {
        appLog.logACME("app", "main", "timeoutProjectOne", "one");
        const prj = projectStore.get("1");
        if (prj) {
            prj.value.ProjectName = "one - part 2";
            prj.valueChanged("one - part 2");
        }
    }, 5);
}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
