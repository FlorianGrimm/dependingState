import React from 'react';
import ReactDom from 'react-dom';

import {
    DSEventValue
} from 'dependingState';

import AppView, { AppUIState, AppUIStore } from './component/App/AppView';
import { AppStoreManager } from './store/AppStoreManager';
import { ProjectStore } from './store/ProjectStore';

function main() {
    console.trace("main()");

    const projectStore=new ProjectStore("project");
    const appUIStore=new AppUIStore("AppUI", new AppUIState());
    const appStoreManager=new AppStoreManager(
        projectStore, 
        appUIStore);

    appStoreManager.projectStore.set({ProjectId:"1", ProjectName:"one"});
   
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

    setTimeout(()=>{
        appUIStore.stateValue.language = "HALLO";
        appUIStore.stateValue.valueChanged();
    }, 1000);
}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
