import { DSObjectStore, DSStateValueSelf, DSUIProps, DSUIViewStateBase, IDSStateValue } from "dependingState";
import React from "react";
import { getAppStoreManager } from "../../singletonAppStoreManager";
import { IAppStoreManager } from "../../store/AppStoreManager";

import CompAView from "../CompA/CompA";

import type { CompAUIState, CompAUIStore } from "../CompA/CompA";

export class AppViewProjectsUIStateValue extends DSStateValueSelf<AppViewProjectsUIStateValue>{
    compAUIStates: CompAUIState[];

    constructor() {
        super();
        this.compAUIStates = [];
    }
}

export class AppViewProjectsUIStore extends DSObjectStore<AppViewProjectsUIStateValue, AppViewProjectsUIStateValue, "appViewProjectsUIStore"> {
    constructor(value: AppViewProjectsUIStateValue) {
        super("appViewProjectsUIStore", value);
    }

    public postAttached(): void {
        const compAUIStore = (this.storeManager! as unknown as IAppStoreManager).compAUIStore;
        compAUIStore.listenDirtyRelated("appViewProjectsUIStore", this);
    }

    public processDirty(): void {
        const compAUIStore = (this.storeManager! as unknown as IAppStoreManager).compAUIStore;
        const compAUIStates = (Array.from(compAUIStore.entities.values())
            .sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
        );
        this.stateValue.compAUIStates = compAUIStates;
        this.stateValue.valueChanged();
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
        storeManager.process("handleClick", () => {
            for (let i = 0; i < 1000; i++) {
                const n = projectStore.entities.size + 1;
                projectStore.set({ ProjectId: n.toString(), ProjectName: `Name - ${n}` });
            }
        });
    }

    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        const { compAUIStates } = viewProps;

        return (<>
        <div>list</div>
            {compAUIStates.map((compAUIState) => React.createElement(CompAView, compAUIState.getViewProps()))}
        </>);
    }
}