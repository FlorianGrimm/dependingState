import { DSEntityStore, DSStateValue, DSUIProps, DSUIViewStateBase } from "dependingState";
import React from "react";
import { getNotNice } from "../../dirtyharry";
import { Project } from "../../types";

type CompAViewProps = DSUIProps<Project>;

type CompAViewState = {

}
& DSUIViewStateBase
;


export class CompAUIState extends DSStateValue<CompAUIState> {
    ProjectId:string;
    ProjectName:string;
    Magic:string;
    constructor(project:Project) {
        super(null!);
        this.value=this;
        this.ProjectId=project.ProjectId;
        this.ProjectName=project.ProjectName;
        this.Magic="";
    }
    
    public get key() : string {
        return this.ProjectId;
    }
}

export class CompAUIStore extends DSEntityStore<string, CompAUIState, CompAUIState>{
    constructor(storeName: string) {
        super(storeName, (item:CompAUIState)=>item, (item:CompAUIState)=>item.ProjectId);
    }
}


export default class CompAView extends React.Component<CompAViewProps, CompAViewState>{
    constructor(props: CompAViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        this.handleClick=this.handleClick.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleClick(){
        const viewProps = this.props.getViewProps();
        getNotNice().emitEvent({storeName:"compAUI", event:"hugo", payload: viewProps});

        /*
        const prj = getNotNice().projectStore.get(viewProps.ProjectId);
        if(prj){ 
            prj.value.ProjectName = (new Date()).toISOString();
            prj.valueChanged();
        }
        */
    }
    render(): React.ReactNode {
        const viewProps = this.props.getViewProps();
        
        return (<div>
            CompA  - ProjectName:{viewProps.ProjectName} - StateVersion: { this.props.getStateVersion() }
            <button onClick={this.handleClick}>ola</button>
        </div>);

        // return (<div>
        //     CompA - hugo: { this.props.hugo }
        // </div>);
    }
}