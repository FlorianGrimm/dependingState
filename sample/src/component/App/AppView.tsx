import {
    DSObjectStore,
    DSStateValue,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { AppStoreManager } from "src/store/AppStoreManager";

import CompAView from "../CompA/CompA";

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

    getOneProject(){
        // pfusch
        return Array.from((this.store!.storeManager! as AppStoreManager).projectStore.entities.values())[0];
    }
}

export class AppUIStore extends DSObjectStore<AppUIState, AppUIState> {
    constructor(storeName: string, value: AppUIState) {
        super(storeName, value);
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
    }
    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    render(): React.ReactNode {
        const viewProps = this.props.getViewProps();
        const aViewProps = viewProps.getOneProject().getUIStateValue().getViewProps();
        return (<div>
            App
            <div>
                language:{viewProps.language} - StateVersion: { this.props.getStateVersion() }
            </div>
            { React.createElement(CompAView, aViewProps) }
      </div>);
    }
}