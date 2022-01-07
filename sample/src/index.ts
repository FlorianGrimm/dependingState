import React from 'react';
import ReactDom from 'react-dom';

import {
    DSEvent,
    DSEventAttach,
    DSEventValue,
    DSPayloadEntity
} from 'dependingState';

import AppView, { AppUIState, AppUIStore } from './component/App/AppView';
import { AppStoreManager } from './store/AppStoreManager';
import { ProjectStore } from './store/ProjectStore';
import { setNotNice } from './dirtyharry';
import { Project } from './types';
import { CompAUIState, CompAUIStore } from './component/CompA/CompA';

function main() {
    console.trace("main()");

    const projectStore = new ProjectStore("project");
    const compAUIStore = new CompAUIStore("compAUI");
    const appUIStore = new AppUIStore("AppUI", new AppUIState());
    const appStoreManager = new AppStoreManager(
        projectStore,
        appUIStore,
        compAUIStore);
    setNotNice(appStoreManager);

    (window as any).appStoreManager = appStoreManager;

    appUIStore.getProjects = (() => {
        return (Array.from(compAUIStore.entities.values()) as unknown[] as CompAUIState[]).slice(0,100);
    });

    compAUIStore.listenEvent<DSPayloadEntity<any>, "attach">({ storeName: "compAUI", event: "attach" }, (e: DSEventAttach<any>) => {
        appStoreManager.appUIStore.stateValue.valueChanged();
    });

    projectStore.listenEvent<DSPayloadEntity<Project>, "attach">({ storeName: "project", event: "attach" }, (e: DSEventAttach<Project>) => {
        appStoreManager.compAUIStore.set(new CompAUIState(e.payload.entity.value));
    });

    projectStore.listenEvent<DSPayloadEntity<Project>, "value">({ storeName: "project", event: "value" }, (e: DSEventValue<Project>) => {
        const prj = e.payload.entity.value;
        const compAUIState = appStoreManager.compAUIStore.get(prj.ProjectId);
        if (compAUIState) {
            compAUIState.value.ProjectName = prj.ProjectName;
            compAUIState.valueChanged();
        }
    });

    projectStore.listenEvent<Project, "hugo">({ storeName: "compAUI", event: "hugo" }, (e: DSEvent<Project>) => {
        const prj = appStoreManager.projectStore.get(e.payload.ProjectId);
        if (prj) {
            prj.value.ProjectName = (new Date()).toISOString();
            prj.valueChanged();
        }
    });


    appStoreManager.projectStore.set({ ProjectId: "1", ProjectName: "one" });

    const rootElement = React.createElement(
        AppView,
        appStoreManager.appUIStore.stateValue.getUIStateValue().getViewProps()
    );
    const appRootElement = window.document.getElementById("appRoot");
    if (appRootElement) {
        ReactDom.render(rootElement, appRootElement);
    } else {
        console.error("'appRoot' not defined.");
    }

    setTimeout(() => {
        appUIStore.stateValue.language = "HALLO";
        appUIStore.stateValue.valueChanged();
    }, 1000);

    setTimeout(() => {
        const prj = projectStore.get("1");
        if (prj) {
            prj.value.ProjectName = "one - part 2";
            prj.valueChanged();
        }
    }, 2000);
}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
