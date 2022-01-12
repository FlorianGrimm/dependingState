import { DSEntityStore, DSEvent, DSEventAttach, DSEventDetach, DSEventValue, DSStateValue, DSUIProps, DSUIViewStateBase } from "dependingState";
import React from "react";
import { IAppStoreManager } from "src/store/AppStoreManager";
import { dsLog } from "../../../../dependingState/src/DSLog";
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

export class CompAUIStore extends DSEntityStore<string, CompAUIState, CompAUIState, "compAUIStore">{
    //compAUIStates: CompAUIState[];

    constructor() {
        super("compAUIStore", { create: (item: CompAUIState) => item, getKey: (item: CompAUIState) => item.ProjectId });
        //this.compAUIStates = [];
    }

    public postAttached(): void {
        //debugger;
        var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
        projectStore.listenEventAttach(this.storeName, (e) => {
            //debugger;
            const project = e.payload.entity.value;
            this.attach(project.ProjectId, new CompAUIState(project));
            this.isDirty = true;
        });
        projectStore.listenEventDetach(this.storeName, (e) => {
            this.detach(e.payload.key);
            this.isDirty = true;
        });
        projectStore.listenEventValue(this.storeName, (e) => {
            const key=e.payload.entity.value.ProjectId;
            var compAUIState = this.get(key);
            if (compAUIState) {
                compAUIState.value.ProjectName = e.payload.entity.value.ProjectName;
                compAUIState.valueChanged();
            } else{
                dsLog.warn(`compAUIState wiht ${key} not found.`)
            }
        });
        this.listenEvent<DSEvent<Project>>(this.storeName, "hugo", (e) => {
            var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
            const prj = projectStore.get(e.payload.ProjectId);
            if (prj) {
                prj.value.ProjectName = (new Date()).toISOString();
                prj.valueChanged();
            }
        });
    }

    public processDirty(): void {
        this.emitDirty(null!);
    }
    // public processDirty(): void {
    //     const compAUIStates = (Array.from(this.entities.values())
    //         .sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
    //     );
    //     this.compAUIStates = compAUIStates;
    //     this.compAUIStates.forEach((item)=>item.valueChanged())
    // }
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
        console.group("hugo");
        try{
            const viewProps = this.props.getRenderProps();
            getAppStoreManager().emitEvent({ storeName: "compAUIStore", event: "hugo", payload: viewProps });
        }finally{
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