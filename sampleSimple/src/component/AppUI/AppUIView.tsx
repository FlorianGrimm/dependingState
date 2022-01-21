import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";

import { AppUIValue } from "./AppUIValue";
import { countDown, countUp } from "./AppUIActions";

type AppViewProps = {
} & DSUIProps<AppUIValue>;

type AppViewState = {
} & DSUIViewStateBase;

const counterStyle: React.CSSProperties = {
    backgroundColor: "#dddddd",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};

export function appView(props: AppViewProps) {
    return React.createElement(AppView, props);
}

export default class AppView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);

        this.handleDown = this.handleDown.bind(this);
        this.handleUp = this.handleUp.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }
    handleDown(){
        countDown.emitEvent(undefined);
    }
    handleUp(){
        countUp.emitEvent(undefined);
    }

    render(): React.ReactNode {
        const {counter, clicks} = this.props.getRenderProps();

        return (<div>
            <h1>samplesimple</h1>
            <div>
                AppUIView -  StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>

            <div style={counterStyle}>
                Counter: {counter} <button onClick={this.handleDown}>&lt;</button> <button onClick={this.handleUp}>&gt;</button> <br/>
                Clicks: {clicks}
            </div>

            <div>
                P.S.<br />
            
                Why does count-down work and count-up not? <br />
                Have a look at F12 - Console and click down then up. Can you spot the difference?<br />
                Please read the readme.md<br />
                Need help? search for "// hint1" within the files *.ts.
            </div>

        </div>);
    }
}
