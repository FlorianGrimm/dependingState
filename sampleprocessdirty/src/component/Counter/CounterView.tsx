import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";
import { countDown, countUp } from "./CounterActions";

import type { CounterValue } from "./CounterValue";

type AppViewProps = {
} & DSUIProps<CounterValue>;

type AppViewState = {
} & DSUIViewStateBase;

const counterStyle: React.CSSProperties = {
    backgroundColor: "#ff0000",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};

/**
 * create a new CounterView
 * @param props stateValue.getViewProps()
 */
export function counterView(props: AppViewProps): React.ReactNode {
    return React.createElement(CounterView, props)
}
export default class CounterView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        this.handleClickDown = this.handleClickDown.bind(this);
        this.handleClickUp = this.handleClickUp.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleClickDown() {
        countDown.emitEventAndProcess("handle", undefined);
    }
    handleClickUp() {
        countUp.emitEventAndProcess("handle",undefined);
    }

    render(): React.ReactNode {
        const { nbrValue } = this.props.getRenderProps();

        return (<div style={counterStyle}>
            Counter2: {nbrValue} <button onClick={this.handleClickDown}>&lt;</button> <button onClick={this.handleClickUp}>&gt;</button> <br />
        </div>);
    }
}