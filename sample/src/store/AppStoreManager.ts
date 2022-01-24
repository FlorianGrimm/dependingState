import {
    DSStoreManager
} from "dependingState";
// import React from "react";
import type { AppUIStore } from "~/component/AppUI/AppUIStore";
import type { AppViewProjectsUIStore } from "~/component/AppUIProjects/AppUIProjectsStore";
import type { CompAStore } from "src/component/CompA/CompAStore";
import { IDSStoreManager } from "dependingState";
import type { AppStore } from "./AppState";
import type { ProjectStore } from "./ProjectStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    projectStore: ProjectStore;
    appUIStore: AppUIStore;
    compAStore: CompAStore;
    appViewProjectsUIStore: AppViewProjectsUIStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public projectStore: ProjectStore,
        public appUIStore: AppUIStore,
        public compAStore: CompAStore,
        public appViewProjectsUIStore: AppViewProjectsUIStore
    ) {
        super();
        this.attach(appStore);
        this.attach(projectStore);
        this.attach(appUIStore);
        this.attach(compAStore);
        this.attach(appViewProjectsUIStore);
    }
}