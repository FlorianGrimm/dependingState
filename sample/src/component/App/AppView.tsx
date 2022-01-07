import {
    DSObjectStore,
    DSStateValue,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { getNotNice } from "../../dirtyharry";
import { AppStoreManager } from "../../store/AppStoreManager";

import CompAView, { CompAUIState } from "../CompA/CompA";

/*
import type { TStateRootAppStates } from "../../types";
import { UIPropsGetStateVersion } from "dependingState";
*/


export class AppUIState extends DSStateValue<AppUIState> {
    language: string;


    constructor() {
        super(null!);
        this.value = this;
        this.language = "en";

    }

    getOneProject() {
        // pfusch
        return Array.from((this.store!.storeManager! as AppStoreManager).projectStore.entities.values())[0];
    }
    getProjects(): CompAUIState[] {
        return (this.store as AppUIStore).getProjects();
    }

}

export class AppUIStore extends DSObjectStore<AppUIState, AppUIState> {
    getProjects: () => CompAUIState[];

    constructor(storeName: string, value: AppUIState) {
        super(storeName, value);
        this.getProjects = (() => []);
    }

    // getProject() {
    //     //console.log("2");
    //     // this.stateValue.value.hugo1();
    //     //this.stateValue.hugo1();
    //     return Array.from((this.storeManager! as AppStoreManager).projectStore.entities.values())[0];
    // }
}

type AppViewProps = {
    //stateRoot: TStateRootAppStates;
} & DSUIProps<AppUIState>;

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
        const storeManager = getNotNice();
        const projectStore = storeManager.projectStore;
        storeManager.process(() => {
            for (let i = 0; i < 1000; i++) {
                const n = projectStore.entities.size + 1;
                projectStore.set({ ProjectId: n.toString(), ProjectName: `Name - ${n}` });
            }
        });
    }

    render(): React.ReactNode {
        const viewProps = this.props.getViewProps();
        // const aViewProps = viewProps.getOneProject().getUIStateValue().getViewProps();
        return (<div>
            App
            <div>
                language:{viewProps.language} - StateVersion: {this.props.getStateVersion()}
            </div>
            <div>
                <button onClick={this.handleClick}>add</button>
            </div>
            {viewProps.getProjects().map((compAUIState) => React.createElement(CompAView, compAUIState.getUIStateValue().getViewProps()))}
        </div>);
    }
}