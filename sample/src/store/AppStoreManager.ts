import {
    DSStoreManager
} from "dependingState";
// import React from "react";
import type { AppViewStore } from "src/component/App/AppView";
import type { AppViewProjectsUIStore } from "src/component/App/AppViewProjectsUIStore";
import type { CompAStore } from "src/component/CompA/CompAStore";
import { IDSStoreManager } from "dependingState";
import type { AppStore } from "./AppState";
import type { ProjectStore } from "./ProjectStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    projectStore: ProjectStore;
    appViewStore: AppViewStore;
    compAUIStore: CompAStore;
    appViewProjectsUIStore: AppViewProjectsUIStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public projectStore: ProjectStore,
        public appViewStore: AppViewStore,
        public compAUIStore: CompAStore,
        public appViewProjectsUIStore: AppViewProjectsUIStore
    ) {
        super();
        this.attach(appStore);
        this.attach(projectStore);
        this.attach(appViewStore);
        this.attach(compAUIStore);
        this.attach(appViewProjectsUIStore);

        this.postAttached();
    }
}