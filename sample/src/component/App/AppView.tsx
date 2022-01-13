import {
    dsLog,
    DSObjectStore,
    DSStateValue,
    DSStateValueSelf,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import type { AppState } from "../../store/AppState";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { getAppStoreManager } from "../../singletonAppStoreManager";

import AppViewProjects from "./AppViewProjects";
import { AppViewProjectsUIStateValue } from "./AppViewProjectsUIStateValue";

/*
import type { TStateRootAppStates } from "../../types";
import { UIPropsGetStateVersion } from "dependingState";
*/


export class AppViewStateValue extends DSStateValueSelf<AppViewStateValue> {
    appState: AppState | undefined;
    appViewProjectsUIStateValue:AppViewProjectsUIStateValue|undefined;

    constructor() {
        super();
    }
}

export class AppViewStore extends DSObjectStore<AppViewStateValue, AppViewStateValue, "appViewStore"> {
    appStateStateVersion: number;
    appViewProjectsUIStoreStateVersion: number;

    constructor(value: AppViewStateValue) {
        super("appViewStore", value);
        this.appStateStateVersion = 0;
        this.appViewProjectsUIStoreStateVersion=0;
    }

    public postAttached(): void {
        super.postAttached();

        const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
        appState.listenDirtyRelated(this.storeName, this);

        // const appViewProjectsUIStore = (this.storeManager! as unknown as IAppStoreManager).appViewProjectsUIStore;
        // appViewProjectsUIStore.listenDirtyRelated(this.storeName, this);

        this.stateValue.appState = appState.stateValue;
        this.isDirty = true;
    }

    public processDirty(): void {
        const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
        const appViewProjectsUIStore = (this.storeManager! as unknown as IAppStoreManager).appViewProjectsUIStore;
        let changed=false;
        if (this.appStateStateVersion !== appState.stateVersion) {
            this.appStateStateVersion = appState.stateVersion;
            this.stateValue.appState = appState.stateValue;
            changed=true;
        }
     
        if (this.appViewProjectsUIStoreStateVersion !== appViewProjectsUIStore.stateVersion) {
            this.appViewProjectsUIStoreStateVersion = appViewProjectsUIStore.stateVersion;
            this.stateValue.appViewProjectsUIStateValue = appViewProjectsUIStore.stateValue;
            changed=true;
        }
        if (changed){
            this.stateValue.valueChanged();
        }
    }
}

type AppViewProps = {
    //stateRoot: TStateRootAppStates;
} & DSUIProps<AppViewStateValue>;

type AppViewState = {

} & DSUIViewStateBase;

//UIViewState<{}>;

export default class AppView extends React.Component<AppViewProps, AppViewState>{
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
            dsLog.group("handleClick - Adding");
            for (let i = 0; i < 1000; i++) {
                const n = projectStore.entities.size + 1;
                projectStore.set({ ProjectId: n.toString(), ProjectName: `Name - ${n}` });
            }
            dsLog.groupEnd();
            dsLog.group("handleClick - Added");
            storeManager.process();
            dsLog.groupEnd();
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