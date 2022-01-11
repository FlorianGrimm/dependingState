import {
    DSObjectStore,
    DSStateValue,
    DSStateValueSelf,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import type { AppState } from "src/store/AppState";
import { IAppStoreManager } from "src/store/AppStoreManager";
import { getAppStoreManager } from "../../singletonAppStoreManager";

import CompAView, { CompAUIState, CompAUIStore } from "../CompA/CompA";

/*
import type { TStateRootAppStates } from "../../types";
import { UIPropsGetStateVersion } from "dependingState";
*/


export class AppViewStateValue extends DSStateValueSelf<AppViewStateValue> {
    appState: AppState | undefined;
    compAUIStates: CompAUIState[];

    constructor() {
        super();
        this.compAUIStates=[];
    }
}

export class AppViewStore extends DSObjectStore<AppViewStateValue, AppViewStateValue> {
    getProjects: () => CompAUIState[];
    appStateStateVersion: number;
    compAUIStoreStateVersion: number;

    constructor(storeName: string, value: AppViewStateValue) {
        super(storeName, value);
        this.appStateStateVersion = 0;
        this.compAUIStoreStateVersion = 0;
        this.getProjects = (() => []);
    }

    public postAttached(): void {
        super.postAttached();

        const appState = (this.storeManager! as unknown as IAppStoreManager).appState;
        appState.listenDirtyRelated(this);

        const compAUIStore = (this.storeManager! as unknown as IAppStoreManager).compAUIStore;
        compAUIStore.listenDirtyRelated(this);

        this.stateValue.appState = appState.stateValue;
        this.isDirty = true;
    }

    public processDirty(): boolean {
        const result = super.processDirty();
        if (result) {
            const appState = (this.storeManager! as unknown as IAppStoreManager).appState;
            const compAUIStore = (this.storeManager! as unknown as IAppStoreManager).compAUIStore;
            let changed=false;
            if (this.appStateStateVersion !== appState.stateVersion) {
                this.appStateStateVersion = appState.stateVersion;
                this.stateValue.appState = appState.stateValue;
                changed=true;
            }
            if (this.compAUIStoreStateVersion !== compAUIStore.stateVersion) {
                this.compAUIStoreStateVersion = compAUIStore.stateVersion;
                this.stateValue.compAUIStates = compAUIStore.compAUIStates;
                changed=true;
            }
        }
        return result;
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
        this.handleClick = this.handleClick.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleClick() {
        const storeManager = getAppStoreManager();
        const projectStore = storeManager.projectStore;
        storeManager.process(() => {
            for (let i = 0; i < 1000; i++) {
                const n = projectStore.entities.size + 1;
                projectStore.set({ ProjectId: n.toString(), ProjectName: `Name - ${n}` });
            }
        });
    }

    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        let language = (viewProps.appState?.language) || "";

        return (<div>
            App
            <div>
                language:{language} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleClick}>add</button>
            </div>
            {viewProps.compAUIStates.map((compAUIState) => React.createElement(CompAView, compAUIState.getUIStateValue().getViewProps()))}
        </div>);
    }
}