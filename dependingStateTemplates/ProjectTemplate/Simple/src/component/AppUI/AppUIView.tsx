import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";

import type { AppUIValue } from "./AppUIValue";

type AppViewProps = {
} & DSUIProps<AppUIValue>;

type AppViewState = {
} & DSUIViewStateBase;

/**
 * create a new AppUIView
 * @param props stateValue.getViewProps()
 */
export function appUIView(props:AppViewProps): React.CElement<AppViewProps, AppUIView>{
    return React.createElement(AppUIView, props)
}
export default class AppUIView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
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
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();

        return (<div>
            App
            <div>
                AppUI - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleClick}>doSomething</button>
            </div>
            
        </div>);
    }
}