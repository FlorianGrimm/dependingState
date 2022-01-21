import {
    DSObjectStore,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";

import { getAppStoreManager } from "../../singletonAppStoreManager";
import AppViewProjects from "../AppUIProjects/AppUIProjectsView";
import { AppUIValue } from "./AppUIValue";


type AppViewProps = {
} & DSUIProps<AppUIValue>;

type AppViewState = {
} & DSUIViewStateBase;

export default class AppUIView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        this.handleClickAdd = this.handleClickAdd.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleClickAdd() {
        const storeManager = getAppStoreManager();
        const projectStore = storeManager.projectStore;
        storeManager.process("handleClickAdd",() => {
            //dsLog.group("handleClick - Adding");
            for (let i = 0; i < 1000; i++) {
                const n = projectStore.entities.size + 1;
                projectStore.set({ ProjectId: n.toString(), ProjectName: `Name - ${n}` });
            }
            // dsLog.groupEnd();
            // dsLog.group("handleClick - Added");
            storeManager.process();
            // dsLog.groupEnd();
        });
    }

    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        const language = (viewProps.appState?.language) || "";
        const appViewProjectsUIStateValue = viewProps.appViewProjectsUIStateValue;

        return (<div>
            App
            <div>
                language:{language} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleClickAdd}>add</button>
            </div>
            { appViewProjectsUIStateValue && React.createElement(AppViewProjects, appViewProjectsUIStateValue.getViewProps())}
        </div>);
    }
}