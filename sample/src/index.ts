import React from 'react';
import ReactDom from 'react-dom';

import {
    IStateTransformator
} from 'dependingState';

import {
    AppRootState, getInitalState
} from './AppRootState';

import AppView from './component/App/AppView';

function main() {
    console.trace("main()");

    // const initalState = getInitalState();
    // const appState = new AppRootState(initalState);
    // const appProps = {};
    // const u = appState.states["uiRoot"];

    const appState = new AppRootState(getInitalState);
    const rootElement = React.createElement(
        AppView,
        appState.states.uiRoot.getViewProps()
    );
    const appRootElement = window.document.getElementById("appRoot");
    if (appRootElement) {
        ReactDom.render(rootElement, appRootElement);
    } else {
        console.error("'appRoot' not defined.");
    }
}
try {
    main();
} catch (err) {
    console.error("Error while app boots.", err);
}
