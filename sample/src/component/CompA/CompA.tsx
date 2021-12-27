import { UIProps, StateBase, UIViewState, UIViewStateVersion } from "dependingState";
import React from "react";

type CompAViewProps = {};

type CompAViewState = UIViewState<{}>;

export class CompAUIState extends StateBase<CompAUIState> {
    static getInitalState(): CompAUIState {
        return new CompAUIState();
    }

    constructor() {
        super();
    }
}

export default class CompAView extends React.Component<UIProps<CompAViewProps>, CompAViewState>{
    constructor(props: UIProps<CompAViewProps>) {
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
        return (<div>
            CompA - StateVersion: { this.props.getStateVersion() }
        </div>);
    }
}