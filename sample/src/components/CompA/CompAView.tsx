import React from "react";
import NumberInput from "../NumberInput/NumberInput";

import { DSUIProps, DSUIViewStateBase, getPropertiesChanged,bindUIComponent } from "dependingState";

import { changeProjectName } from "./CompAActions";
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
        this.state=
            bindUIComponent(this, props)
                .bindHandleAll()
                .setComponentWillUnmount()
                .getState();
        // this.state = {
        //     stateVersion: this.props.getStateVersion()
        // };
        // this.props.wireStateVersion(this);
        // this.handleClickChangeProjectName = this.handleClickChangeProjectName.bind(this);
        // this.handleSetA = this.handleSetA.bind(this);
        // this.handleSetB = this.handleSetB.bind(this);
        console.log("CompAView", this.props);
    }

    handleClickChangeProjectName() {
        changeProjectName.emitEvent(this.props.getRenderProps());
    }

    handleSetA(n: number) {
        getAppStoreManager().process("handleSetA", () => {
            const renderProps = this.props.getRenderProps();
            const renderPropsPC = getPropertiesChanged(renderProps);
            renderPropsPC.setIf("nbrA", n);
            renderPropsPC.valueChangedIfNeeded("handleSetA");
        });
    }
    handleSetB(n: number) {
        getAppStoreManager().process("handleSetB", () => {
            const renderProps = this.props.getRenderProps();
            const renderPropsPC = getPropertiesChanged(renderProps);
            renderPropsPC.setIf("nbrB", n);
            renderPropsPC.valueChangedIfNeeded("handleSetB");
        });
    }
    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        return (<div>
            CompA - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}<br />
            ProjectName:{viewProps.ProjectName} <button onClick={this.handleClickChangeProjectName}>Change ProjectName</button> <br />            
            A:<NumberInput n={viewProps.nbrA} setValue={this.handleSetA} inputStyle={inputStyle} /> +
            B:<NumberInput n={viewProps.nbrB} setValue={this.handleSetB} inputStyle={inputStyle} /> =
            c:{viewProps.nbrC}
        </div>);
    }
}