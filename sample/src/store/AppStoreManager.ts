import {
    DSStoreManager
} from "dependingState";
// import React from "react";
import type { AppViewStore } from "src/component/App/AppView";
import type { AppViewProjectsUIStore } from "src/component/App/AppViewProjects";
import type { CompAUIStore } from "src/component/CompA/CompA";
import { IDSStoreManager } from "../../../dependingState/src/types";
import type { AppStore } from "./AppState";
import type { ProjectStore } from "./ProjectStore";

export interface IAppStoreManager extends IDSStoreManager {
    appState: AppStore;
    projectStore: ProjectStore;
    appViewStore: AppViewStore;
    compAUIStore: CompAUIStore;
    appViewProjectsUIStore: AppViewProjectsUIStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appState: AppStore,
        public projectStore: ProjectStore,
        public appViewStore: AppViewStore,
        public compAUIStore: CompAUIStore,
        public appViewProjectsUIStore: AppViewProjectsUIStore
    ) {
        super();
        this.attach(projectStore);
        this.attach(appViewStore);
        this.attach(compAUIStore);
        this.attach(appViewProjectsUIStore);

        this.postAttached();
    }
}