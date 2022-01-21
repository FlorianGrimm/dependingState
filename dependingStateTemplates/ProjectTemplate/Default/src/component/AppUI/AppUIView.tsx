import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { AppUIValue } from "./AppUIValue";
import { routerPush } from "dependingStateRouter";
import { navigatorView } from "../Navigator/NavigatorView";
import { getAppStoreManager } from "~/singletonAppStoreManager";

type AppUIViewProps = {
} & DSUIProps<AppUIValue>;

type AppUIViewState = {
} & DSUIViewStateBase;


export default class AppUIView extends React.Component<AppUIViewProps, AppUIViewState>{
    constructor(props: AppUIViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);

        const navigatorStateValue = getAppStoreManager().navigatorStore.stateValue;
        navigatorStateValue.getViewProps().wireStateVersion<any>(this);

        this.handleClickPageA = this.handleClickPageA.bind(this);
        this.handleClickPageB = this.handleClickPageB.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
        const navigatorStateValue = getAppStoreManager().navigatorStore.stateValue;
        navigatorStateValue.getViewProps().unwireStateVersion<any>(this);
    }
    handleClickPageA() {
        routerPush.emitEvent({ to: "/PageA" });
    }
    handleClickPageB() {
        routerPush.emitEvent({ to: "/PageB" });
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();
        const navigatorSV = getAppStoreManager().navigatorStore.stateValue;

        return (<div>
            <div>
                AppUIView StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleClickPageA}>PageA</button>
                :
                <button onClick={this.handleClickPageB}>PageB</button>
            </div>
            <div>
                {navigatorView(navigatorSV.getViewProps())}
            </div>
        </div>);
    }
}