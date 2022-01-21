import React from "react";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import { PageAValue } from "./PageAValue";
import { doSomething } from "./PageAActions";

export type PageAViewProps = DSUIProps<PageAValue>;

export type PageAViewState = {
} & DSUIViewStateBase;

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
            <h2>PageA</h2>
            myPropa:<input value={renderProps.myPropA} onChange={this.handleOnChange}></input>
            <button onClick={this.handleClick}>doSomething</button><br/>
            myPropB:{renderProps.myPropB}
        </div>);
    }
}