import { DSObjectStore, DSStateValueSelf, DSUIProps, DSUIViewStateBase, IDSStateValue } from "dependingState";
import React from "react";
import { getAppStoreManager } from "src/singletonAppStoreManager";
import { WrappedDSStateValue } from "../../../../dependingState/src/types";
import CompAView, { CompAUIState } from "../CompA/CompA";

export class AppViewProjectsUIStateValue extends DSStateValueSelf<AppViewProjectsUIStateValue>{

    constructor() {
        super();
    }

    getProjects(): CompAUIState[] {
        if (this.store === undefined){
            return [];
        } else {
            return (this.store as AppViewProjectsUIStore).getProjects();
        }
    }
}

type x=WrappedDSStateValue<DSStateValueSelf<AppViewProjectsUIStateValue>>;
const y:x = {} as any;
export class AppViewProjectsUIStore extends DSObjectStore<AppViewProjectsUIStateValue, AppViewProjectsUIStateValue> {
    getProjects: () => CompAUIState[];

    constructor(storeName: string, value: AppViewProjectsUIStateValue) {
        super(storeName, value);
        this.getProjects = (() => []);
    }
}

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
        const viewProps = this.props.getViewProps();
        // const aViewProps = viewProps.getOneProject().getUIStateValue().getViewProps();


        return (<>
            {viewProps.getProjects().map((compAUIState) => React.createElement(CompAView, compAUIState.getUIStateValue().getViewProps()))}
        </>);
    }
}