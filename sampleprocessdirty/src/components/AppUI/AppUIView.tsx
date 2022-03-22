import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { AppUIValue } from "./AppUIValue";
import { countDown, countUp } from "./AppUIActions";
import { getAppStoreManager } from "~/singletonAppStoreManager";
import { counterView } from "../Counter/CounterView";
import { sumView } from "../Sum/SumView";

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
    return React.createElement(AppUIView, props);
}

export default class AppUIView extends React.Component<AppViewProps, AppViewState>{
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
    handleDown() {
        countDown.emitEventAndProcess("handler", undefined);
    }
    handleUp() {
        countUp.emitEventAndProcess("handler", undefined);
    }

    render(): React.ReactNode {
        const { counter, clicks } = this.props.getRenderProps();

        return (<div>
            <h1>sampleprocessdirty</h1>
            <div>
                AppUIView -  StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>

            <div style={counterStyle}>
                Counter1: {counter} <button onClick={this.handleDown}>&lt;</button> <button onClick={this.handleUp}>&gt;</button> <br />
                Clicks: {clicks}
            </div>

            {counterView(getAppStoreManager().counterStore.stateValue.getViewProps())}

            {sumView(getAppStoreManager().sumStore.stateValue.getViewProps())}

            <div>
                P.S.<br />

                Counter1 + Counter2 = Sum<br />
                <br />
                Find the bug!<br />
                <br />

                Counter1 Up; Counter2 Up; Counter1 Up;<br />
                Why does the Counter2 not effect the sum?<br />

                Have a look at F12 - Console. Can you spot the difference?<br />
                Please read the readme.md<br />
                Need help? search for "// hint1" within the files *.ts.<br />
                Need more help? search for "// hint2" within the files *.ts.<br />
            </div>

        </div>);
    }
}
