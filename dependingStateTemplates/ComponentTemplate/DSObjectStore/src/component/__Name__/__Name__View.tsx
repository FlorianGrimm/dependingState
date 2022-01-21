import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";

import type { __Name__Value } from "./__Name__Value";

type AppViewProps = {
} & DSUIProps<__Name__Value>;

type AppViewState = {
} & DSUIViewStateBase;

/**
 * create a new __Name__View
 * @param props stateValue.getViewProps()
 */
export function __name__View(props:AppViewProps): React.ReactNode{
    return React.createElement(__Name__View, props)
}
export default class __Name__View extends React.Component<AppViewProps, AppViewState>{
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

    handleClickAdd() {
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();

        return (<div>
            App
            <div>
                __Name__ - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleClickAdd}>add</button>
            </div>
            
        </div>);
    }
}