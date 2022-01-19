import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { AppUIValue } from "./AppUIValue";
import { calculatorView } from "../Calculator/CalculatorView";
import { getAppStoreManager } from "~/singletonAppStoreManager";

type AppViewProps = {
} & DSUIProps<AppUIValue>;

type AppViewState = {
} & DSUIViewStateBase;

//UIViewState<{}>;
export function appView(props:AppViewProps){
    return React.createElement(AppView, props);
}

export default class AppView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
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
        const viewProps = this.props.getRenderProps();
        const calculator= getAppStoreManager().calculatorStore.stateValue;
        return (<div>
            <div>
                AppUIView -  StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                {viewProps.calculator && calculatorView(viewProps.calculator.getViewProps())}
            </div>

            <div>
                {calculator && calculatorView(calculator.getViewProps())}
            </div>
            <div>
                {viewProps.calculator && calculatorView(viewProps.calculator.getViewProps())}
            </div>

            <div>
                {calculator && calculatorView(calculator.getViewProps())}
            </div>
        </div>);
    }
}