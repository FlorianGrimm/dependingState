import React from "react";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import NumberInput from "../NumberInput/NumberInput";
import { PageAValue } from "./PageAValue";
import { getAppStoreManager } from "../../singletonAppStoreManager";

type PageAViewProps = DSUIProps<PageAValue>;

type PageAViewState = {
} & DSUIViewStateBase;
const inputStyle: React.CSSProperties = {
    width: 30,
};
export function pageAView(props: PageAViewProps) {
    return React.createElement(PageAView, props);
}
export default class PageAView extends React.Component<PageAViewProps, PageAViewState>{
    constructor(props: PageAViewProps) {
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
        if (viewProps.isLoading) {
            return (<div>
                <div>
                    PageA - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
                </div>
                <h2>PageA</h2>
                loading 1/2 secs
            </div>);
        }
        return (<div>
            <div>
                PageA - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <h2>PageA</h2>
            A:<NumberInput n={viewProps.nbrA} setValue={this.handleSetA} inputStyle={inputStyle} /> +
            B:<NumberInput n={viewProps.nbrB} setValue={this.handleSetB} inputStyle={inputStyle} /> =
            c:{viewProps.nbrC}
            <button onClick={this.handleClick}>doSomething</button>
        </div>);
    }
}
