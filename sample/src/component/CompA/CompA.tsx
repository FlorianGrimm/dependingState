import { DSEntityStore, DSEvent, DSEventAttach, DSEventDetach, DSEventValue, DSStateValue, DSUIProps, DSUIViewStateBase } from "dependingState";
import React from "react";
import { IAppStoreManager } from "src/store/AppStoreManager";
import { getAppStoreManager } from "../../singletonAppStoreManager";
import { Project } from "../../types";

type CompAViewProps = DSUIProps<Project>;

type CompAViewState = {

}
    & DSUIViewStateBase
    ;


export class CompAUIState extends DSStateValue<CompAUIState> {
    ProjectId: string;
    ProjectName: string;
    Magic: string;
    constructor(project: Project) {
        super(null!);
        this.value = this;
        this.ProjectId = project.ProjectId;
        this.ProjectName = project.ProjectName;
        this.Magic = "";
    }

    public get key(): string {
        return this.ProjectId;
    }
}

export class CompAUIStore extends DSEntityStore<string, CompAUIState, CompAUIState>{
    compAUIStates: CompAUIState[];

    constructor(storeName: string) {
        super(storeName, { create: (item: CompAUIState) => item, getKey: (item: CompAUIState) => item.ProjectId });
        this.compAUIStates = [];
    }

    public postAttached(): void {
        //debugger;
        var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
        projectStore.listenEvent<DSEventAttach<Project, string, never>>("attach", (e) => {
            //debugger;
            const project = e.payload.entity;
            this.attach(project.ProjectId, new CompAUIState(project));
            this.isDirty = true;
        });
        projectStore.listenEvent<DSEventDetach<Project, string, never>>("detach", (e) => {
            this.detach(e.payload.key);
            this.isDirty = true;
        });
        projectStore.listenEvent<DSEventValue<Project, string, never>>("value", (e) => {
            var compAUIState = this.get(e.payload.key);
            if (compAUIState) {
                compAUIState.value.ProjectName = e.payload.entity.ProjectName;
                compAUIState.valueChanged();
            }
        });
        projectStore.listenEvent<DSEvent<Project>>("hugo", (e)=>{
            var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
            const prj = projectStore.get(e.payload.ProjectId);
            if (prj) {
                prj.value.ProjectName = (new Date()).toISOString();
                prj.valueChanged();
            }
        });
    }

    public processDirty(): boolean {
        const result = super.processDirty();
        if (result) {
            const compAUIStates = (Array.from(this.entities.values())
                .sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
            );
            this.compAUIStates = compAUIStates;
        }
        return result;
    }
}


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
        const viewProps = this.props.getRenderProps();
        getAppStoreManager().emitEvent({ storeName: "compAUI", event: "hugo", payload: viewProps });

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