import React from "react";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import { Project } from "../../types";
import { ola } from "./CompAActions";
import NumberInput from "../NumberInput/NumberInput";
import { CompAValue } from "./CompAValue";
import { getAppStoreManager } from "../../singletonAppStoreManager";

type CompAViewProps = DSUIProps<CompAValue>;

type CompAViewState = {
} & DSUIViewStateBase;
const inputStyle :React.CSSProperties={
    width: 30,
};
export default class CompAView extends React.Component<CompAViewProps, CompAViewState>{
    constructor(props: CompAViewProps) {
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
        console.group("ola");
        try {
            ola.emitEvent(this.props.getRenderProps());
        } finally {
            console.groupEnd();
        }
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
        return (<div>
            CompA  - ProjectName:{viewProps.ProjectName} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            <button onClick={this.handleClick}>ola</button>
            A:<NumberInput n={viewProps.nbrA} setValue={this.handleSetA} inputStyle={inputStyle} /> +
            B:<NumberInput n={viewProps.nbrB} setValue={this.handleSetB} inputStyle={inputStyle} /> =
            c:{viewProps.nbrC}
        </div>);

        // return (<div>
        //     CompA - hugo: { this.props.hugo }
        // </div>);
    }
}