import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { NavigatorValue } from "./NavigatorValue";

type NavigatorViewProps = {
} & DSUIProps<NavigatorValue>;

type NavigatorViewState = {
} & DSUIViewStateBase;

//UIViewState<{}>;

export default class NavigatorView extends React.Component<NavigatorViewProps, NavigatorViewState>{
    constructor(props: NavigatorViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        // this.handleClickAdd = this.handleClickAdd.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();
        // 

        return (<div>
            <div>
                Navigator - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                show page here
            </div>
            <div>
                { renderProps.page }
            </div>

        </div>);
    }
}