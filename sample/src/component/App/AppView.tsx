import { UIProps, StateBase, UIViewState, UIViewStateVersion } from "dependingState";
import React from "react";
import type { TStateRootAppStates } from "../../types";
import CompAView from "../CompA/CompA";

/*
import { UIPropsGetStateVersion } from "dependingState";
*/


export class AppUIState extends StateBase<AppUIState> {
    static getInitalState(stateRoot: TStateRootAppStates): AppUIState {
        return new AppUIState(stateRoot);
    }
    stateRoot: TStateRootAppStates;
    constructor(stateRoot: TStateRootAppStates) {
        super();
        this.stateRoot = stateRoot;
    }
}

type AppViewProps = {
    stateRoot: TStateRootAppStates;
};

type AppViewState = UIViewState<{}>;

export default class AppView extends React.Component<UIProps<AppViewProps>, AppViewState>{
    constructor(props: UIProps<AppViewProps>) {
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
        const aViewProps = viewProps.stateRoot.states.a.getViewProps();
        return (<div>
            App
            <CompAView {...aViewProps}></CompAView>
            {
                React.createElement(CompAView, aViewProps)
            }
        </div>);
    }
}