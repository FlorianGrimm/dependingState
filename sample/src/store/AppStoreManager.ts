import { 
    DSStoreManager
 } from "dependingState";
import React from "react";
import { AppUIStore } from "src/component/App/AppView";
import { CompAUIStore } from "src/component/CompA/CompA";
import { ProjectStore } from "./ProjectStore";


export class AppStoreManager extends DSStoreManager{
    constructor(        
        public projectStore:ProjectStore,        
        public appUIStore:AppUIStore,
        public compAUIStore:CompAUIStore
    ) {
        super();
        this.attach(projectStore);
        this.attach(appUIStore);
        this.attach(compAUIStore);
    }
}