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

export class AppViewProjectsUIStore extends DSObjectStore<AppViewProjectsUIStateValue, AppViewProjectsUIStateValue> {
    compAUIStore: CompAUIStore | undefined;

    constructor(storeName: string, value: AppViewProjectsUIStateValue) {
        super(storeName, value);
        this.compAUIStore = undefined;
    }

    public postAttached(): void {
        super.postAttached();
        this.compAUIStore = (this.storeManager! as unknown as IAppStoreManager).compAUIStore;
    }

    public processDirty(): boolean {
        if (super.processDirty()) {
            if (this.compAUIStore !== undefined) {
                const compAUIStates = (Array.from(this.compAUIStore.entities.values())
                    .sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
                );
                this.stateValue.compAUIStates = compAUIStates;
                this.stateValue.valueChanged();
            }
            return true;
        } else {
            return false;
        }
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
        const viewProps = this.props.getRenderProps();
        const { compAUIStates } = viewProps;

        return (<>
            {compAUIStates.map((compAUIState) => React.createElement(CompAView, compAUIState.getViewProps()))}
        </>);
    }
}