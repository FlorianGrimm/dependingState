import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";

import type { TimerValue } from "./TimerValue";

type AppViewProps = {
} & DSUIProps<TimerValue>;

type AppViewState = {
} & DSUIViewStateBase;

/**
 * create a new TimerView
 * @param props stateValue.getViewProps()
 */
export function timerView(props: AppViewProps): React.ReactNode {
    return React.createElement(TimerView, props)
}
export default class TimerView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
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
        const renderProps = this.props.getRenderProps();
        const { counter } = renderProps;
        return (<div>
            <div>
                Timer - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                Timer: {counter}
            </div>

        </div>);
    }
}
