import {
    DSUIProps,
    DSUIViewStateBase,
    bindUIComponent
} from "dependingState";

import React from "react";
import { AppUIValue } from "./AppUIValue";
import { routerPush } from "dependingStateRouter";
import NavigatorView from "../Navigator/NavigatorView";
import { getAppStoreManager } from "~/singletonAppStoreManager";
import { useNavigatorA, useNavigatorB } from "./AppUIActions";

type AppUIViewProps = {
    //stateRoot: TStateRootAppStates;
} & DSUIProps<AppUIValue>;

type AppUIViewState = {

} & DSUIViewStateBase;

const navigationStyles:React.CSSProperties={
    padding:10
};

export default class AppUIView extends React.Component<AppUIViewProps, AppUIViewState>{
    constructor(props: AppUIViewProps) {
        super(props);
        this.state = 
            bindUIComponent(this, props)
                .add("stateVersion1", getAppStoreManager().navigatorStore.stateValue.getViewProps())
                .bindHandleAll()
                .setComponentWillUnmount()
                .getState();       
        getAppStoreManager().navigatorStore.stateValue.getViewProps().wireStateVersion<any>(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
        getAppStoreManager().navigatorStore.stateValue.getViewProps().unwireStateVersion<any>(this);
    }
    handleClickPageA() {
        routerPush.emitEventAndProcess("to/PageA", { to: "/PageA" });
    }
    handleClickPageB() {
        routerPush.emitEventAndProcess("to/PageB", { to: "/PageB" });
    }
    handleClickNavigatorA() {
        useNavigatorA.emitEventAndProcess("handleClickNavigatorA", "");
    }
    handleClickNavigatorB() {
        useNavigatorB.emitEventAndProcess("handleClickNavigatorB", "");
    }

    render(): React.ReactNode {

        const viewProps = this.props.getRenderProps();
        const navigatorSV = getAppStoreManager().navigatorStore.stateValue;
        const startTime = viewProps.value.startTime;

        return (<div>
            App
            <div>
                startTime:{startTime} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div style={navigationStyles}>
                browser:
                <a href="/PageA">PageA</a>
                :
                <a href="/PageB">PageB</a>
            </div>

            <div style={navigationStyles}>
                history push:
                <button onClick={this.handleClickPageA}>PageA</button>
                :
                <button onClick={this.handleClickPageB}>PageB</button>
            </div>

            <div style={navigationStyles}>
                navigator TODO:
                <button onClick={this.handleClickNavigatorA}>ActionA</button>
                :
                <button onClick={this.handleClickNavigatorB}>ActionB</button>
            </div>

            <div>
                {navigatorSV.value ? "show router now" : "show router here but it's empty"}

            </div>
            {navigatorSV.value && React.createElement(NavigatorView, navigatorSV.getViewProps())}
        </div>);
    }
}