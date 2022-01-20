import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { AppUIValue } from "./AppUIValue";
import { calculatorView } from "../Calculator/CalculatorView";
import { getAppStoreManager } from "~/singletonAppStoreManager";
import { rotateColors } from "../CalculatorStyle/CalculatorStyle";

type AppViewProps = {
} & DSUIProps<AppUIValue>;

type AppViewState = {
} & DSUIViewStateBase;

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

        this.handleRotateColors=this.handleRotateColors.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleRotateColors(){
        rotateColors.emitEvent(undefined);
    }

    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        const calculator = getAppStoreManager().calculatorStore.stateValue;
        const calculatorStyleStore = getAppStoreManager().calculatorStyleStore;

        // mixed up this.props.getRenderProps().calculator and getAppStoreManager().calculatorStore.stateValue
        // since it is mutable this is the same referenced object
        // so basicly you need the AppUIView only and could remove AppUIStore,AppUIValue & AppUIActions

        return (<div>
            <h1>sample style</h1>
            <div>
                AppUIView -  StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                {viewProps.calculator && calculatorView({ calculator: viewProps.calculator.getViewProps(), style: calculatorStyleStore.style1.getViewProps() })}
            </div>

            <div>
                {calculator && calculatorView({ calculator: calculator.getViewProps(), style: calculatorStyleStore.style2.getViewProps() })}
            </div>

            <div>
                {viewProps.calculator && calculatorView({ calculator: viewProps.calculator.getViewProps(), style: calculatorStyleStore.style3.getViewProps() })}
            </div>

            <div>
                {calculator && calculatorView({ calculator: calculator.getViewProps(), style: calculatorStyleStore.style4.getViewProps() })}
            </div>

            <div>
                <button onClick={this.handleRotateColors}>rotateColors</button>
                </div>

        </div>);
    }
}
