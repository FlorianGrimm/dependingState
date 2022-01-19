import React from "react";
import NumberInput from "../NumberInput/NumberInput";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import type { CalculatorValue } from "./CalculatorValue";
import { getAppStoreManager } from "../../singletonAppStoreManager";
import { clearInput } from "./CalculatorActions";

type CalculatorViewProps = DSUIProps<CalculatorValue>;

type CalculatorViewState = {
} & DSUIViewStateBase;

const rootStyle :React.CSSProperties={
    backgroundColor:"yellow",
};
const inputStyle :React.CSSProperties={
    width: 30,
};

export function calculatorView(props:CalculatorViewProps){
    return React.createElement(CalculatorView, props);
}
export default class CalculatorView extends React.Component<CalculatorViewProps, CalculatorViewState>{
    constructor(props: CalculatorViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleSetA = this.handleSetA.bind(this);
        this.handleSetB = this.handleSetB.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleClick() {
        clearInput.emitEvent(this.props.getRenderProps());
    }
    handleSetA(n: number) {
        getAppStoreManager().process("handleSetA", () => {
            const renderProps = this.props.getRenderProps();
            const renderPropsPC = getPropertiesChanged(renderProps);
            renderPropsPC.setIf("nbrA", n);
            renderPropsPC.valueChangedIfNeeded();
        });
    }
    handleSetB(n: number) {
        getAppStoreManager().process("handleSetB", () => {
            const renderProps = this.props.getRenderProps();
            const renderPropsPC = getPropertiesChanged(renderProps);
            renderPropsPC.setIf("nbrB", n);
            renderPropsPC.valueChangedIfNeeded();
        });
    }
    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        return (<div style={rootStyle}>
            <div>
            CalculatorView -  StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                A:<NumberInput n={viewProps.nbrA} setValue={this.handleSetA} inputStyle={inputStyle} /> +
                B:<NumberInput n={viewProps.nbrB} setValue={this.handleSetB} inputStyle={inputStyle} /> =
                c:{viewProps.nbrC}
            </div>
            <div>
                {viewProps.nbrA} + {viewProps.nbrB} = {viewProps.nbrC}
            </div>
            <button onClick={this.handleClick}>doSomething</button>
        </div>);
    }
}