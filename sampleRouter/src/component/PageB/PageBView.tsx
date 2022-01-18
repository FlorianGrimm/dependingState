import React from "react";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import { doSomething } from "./PageBActions";
import NumberInput from "../NumberInput/NumberInput";
import { PageBValue } from "./PageBValue";
import { getAppStoreManager } from "../../singletonAppStoreManager";

type PageBViewProps = DSUIProps<PageBValue>;

type PageBViewState = {
} & DSUIViewStateBase;
const inputStyle :React.CSSProperties={
    width: 30,
};
export default class PageBView extends React.Component<PageBViewProps, PageBViewState>{
    constructor(props: PageBViewProps) {
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
        console.group("doSomething");
        try {
            //doSomething.emitEvent(this.props.getRenderProps());
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
            A:<NumberInput n={viewProps.nbrA} setValue={this.handleSetA} inputStyle={inputStyle} /> +
            B:<NumberInput n={viewProps.nbrB} setValue={this.handleSetB} inputStyle={inputStyle} /> =
            c:{viewProps.nbrC}
            <button onClick={this.handleClick}>doSomething</button>
        </div>);
    }
}