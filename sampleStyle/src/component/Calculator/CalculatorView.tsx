import React from "react";
import NumberInput from "../NumberInput/NumberInput";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import type { CalculatorValue } from "./CalculatorValue";
import type { CalculatorStyleValue } from "../CalculatorStyle/CalculatorStyleValue";
import { getAppStoreManager } from "../../singletonAppStoreManager";
import { clearInput } from "./CalculatorActions";

type CalculatorViewProps =
{
    calculator: DSUIProps<CalculatorValue>;
    style: DSUIProps<CalculatorStyleValue>;
}

type CalculatorViewState = {
} & DSUIViewStateBase;

const inputStyle: React.CSSProperties = {
    width: 30,
};

export function calculatorView(props: CalculatorViewProps) {
    return React.createElement(CalculatorView, props);
}

export default class CalculatorView extends React.Component<CalculatorViewProps, CalculatorViewState>{
    constructor(props: CalculatorViewProps) {
        super(props);
        this.state = {
            stateVersion: Math.max(props.calculator.getStateVersion(),props.style.getStateVersion())
        };
        this.props.calculator.wireStateVersion<any>(this);
        this.props.style.wireStateVersion<any>(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleSetA = this.handleSetA.bind(this);
        this.handleSetB = this.handleSetB.bind(this);
    }

    componentWillUnmount() {
        this.props.calculator.unwireStateVersion<any>(this);
        this.props.style.unwireStateVersion<any>(this);
    }

    handleClick() {
        clearInput.emitEvent(this.props.calculator.getRenderProps());
    }
    handleSetA(n: number) {
        getAppStoreManager().process("handleSetA", () => {
            const renderProps = this.props.calculator.getRenderProps();
            const renderPropsPC = getPropertiesChanged(renderProps);
            renderPropsPC.setIf("nbrA", n);
            renderPropsPC.valueChangedIfNeeded();
        });
    }
    handleSetB(n: number) {
        getAppStoreManager().process("handleSetB", () => {
            const renderProps = this.props.calculator.getRenderProps();
            const renderPropsPC = getPropertiesChanged(renderProps);
            renderPropsPC.setIf("nbrB", n);
            renderPropsPC.valueChangedIfNeeded();
        });
    }
    render(): React.ReactNode {
        const renderPropsCalculator = this.props.calculator.getRenderProps();
        const renderPropsStyle = this.props.style.getRenderProps();
        return (<div style={renderPropsStyle.rootStyle}>
            <div>
                CalculatorView -  StateVersion: {this.props.calculator.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                A:<NumberInput n={renderPropsCalculator.nbrA} setValue={this.handleSetA} inputStyle={inputStyle} /> +
                B:<NumberInput n={renderPropsCalculator.nbrB} setValue={this.handleSetB} inputStyle={inputStyle} /> =
                c:{renderPropsCalculator.nbrC}
            </div>
            <div>
                {renderPropsCalculator.nbrA} + {renderPropsCalculator.nbrB} = {renderPropsCalculator.nbrC}
            </div>
            <button onClick={this.handleClick}>doSomething</button>
        </div>);
    }
}