import { 
    DSStoreManager
 } from "dependingState";
import React from "react";
import { AppUIStore } from "src/component/App/AppView";
import { ProjectStore } from "./ProjectStore";


export class AppStoreManager extends DSStoreManager{
    constructor(        
        public projectStore:ProjectStore,
        public appUIStore:AppUIStore
    ) {
        super();
        this.attach(projectStore);
        this.attach(appUIStore);
    }
}