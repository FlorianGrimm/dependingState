import React from "react";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import { PageBValue } from "./PageBValue";
import { doSomething } from "./PageBActions";

export type PageBViewProps = DSUIProps<PageBValue>;

export type PageBViewState = {
} & DSUIViewStateBase;

export function pageBView(props: PageBViewProps) {
    return React.createElement(PageBView, props);
}

export default class PageBView extends React.Component<PageBViewProps, PageBViewState>{
    constructor(props: PageBViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleClick() {
        doSomething.emitEvent("Hello World!");
    }

    handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        const renderProps = this.props.getRenderProps();
        const renderPropsPC = getPropertiesChanged(renderProps);
        renderPropsPC.setIf("myPropA", e.target.value);
        renderPropsPC.valueChangedIfNeeded();
    }
    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();
        return (<div>
            <h2>PageB</h2>
            myPropa:<input value={renderProps.myPropA} onChange={this.handleOnChange}></input>
            <button onClick={this.handleClick}>doSomething</button><br/>
            myPropB:{renderProps.myPropB}
        </div>);
    }
}