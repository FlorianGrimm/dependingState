import React from "react";
import { DSUIProps, DSUIViewStateBase } from "dependingState";
import { getAppStoreManager } from "../../singletonAppStoreManager";
import { Project } from "../../types";
import { hugo } from "./CompAActions";

type CompAViewProps = DSUIProps<Project>;

type CompAViewState = {
} & DSUIViewStateBase;

export default class CompAView extends React.Component<CompAViewProps, CompAViewState>{
    constructor(props: CompAViewProps) {
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
        console.group("hugo");
        try {
            //const viewProps = this.props.getRenderProps();
            //getAppStoreManager().emitEvent({ storeName: "compAUIStore", event: "hugo", payload: viewProps });
            hugo.emitEvent(this.props.getRenderProps());
            //hugoAction(viewProps);
        } finally {
            console.groupEnd();
        }

        /*
        const prj = getNotNice().projectStore.get(viewProps.ProjectId);
        if(prj){ 
            prj.value.ProjectName = (new Date()).toISOString();
            prj.valueChanged();
        }
        */
    }
    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();

        return (<div>
            CompA  - ProjectName:{viewProps.ProjectName} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            <button onClick={this.handleClick}>ola</button>
        </div>);

        // return (<div>
        //     CompA - hugo: { this.props.hugo }
        // </div>);
    }
}