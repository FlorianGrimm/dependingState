import React from "react";

import { 
    dsLog,
    DSUIProps, 
    DSUIViewStateBase 
} from "dependingState";

import { getAppStoreManager } from "../../singletonAppStoreManager";

import CompAView from "../CompA/CompAView";

import { AppViewProjectsUIStateValue } from "./AppUIProjectsValue";

type AppViewProjectsProps = {
    //stateRoot: TStateRootAppStates;
} & DSUIProps<AppViewProjectsUIStateValue>;

type AppViewProjectsState = {

} & DSUIViewStateBase;

//UIViewState<{}>;

export default class AppViewProjects extends React.Component<AppViewProjectsProps, AppViewProjectsState>{
    constructor(props: AppViewProjectsProps) {
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
        const viewProps = this.props.getRenderProps();
        const { compAVSs: compAUIStates } = viewProps;

        return (<>
        <div>list</div>
            {compAUIStates.map((compAUIState) => React.createElement(CompAView, compAUIState.getViewProps()))}
        </>);
    }
}