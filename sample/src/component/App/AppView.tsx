import { UIProps, StateBase, UIViewState, UIViewStateVersion } from "dependingState";
import React from "react";

/*
import { UIPropsGetStateVersion } from "dependingState";
*/

type AppViewProps = {};

type AppViewState = UIViewState<{}>;

export class AppUIState extends StateBase<AppUIState> {
    static getInitalState(): AppUIState {
        return new AppUIState();
    }

    constructor() {
        super();
    }
}

export default class AppView extends React.Component<UIProps<AppViewProps>, AppViewState>{
    constructor(props: UIProps<AppViewProps>) {
        super(props);
        this.state = {
            stateVersion: this.props.stateVersion
        };
        this.props.wireStateVersion(this);
    }
    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }
    render(): React.ReactNode {
        const viewProps = this.props.getViewProps();
        return (<div>
            App
        </div>);
    }
}