import {
    dsLog,
    DSObjectStore,
    DSStateValue,
    DSStateValueSelf,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import type { AppState } from "../../store/AppState";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { getAppStoreManager } from "../../singletonAppStoreManager";
import { AppUIValue } from "./AppUIValue";
import RouterView from "../Router/RouterView";
import { routerPush } from "../../../../dependingStateRouter/src/DSRouterAction";



type AppUIViewProps = {
    //stateRoot: TStateRootAppStates;
} & DSUIProps<AppUIValue>;

type AppUIViewState = {

} & DSUIViewStateBase;

//UIViewState<{}>;

export default class AppUIView extends React.Component<AppUIViewProps, AppUIViewState>{
    constructor(props: AppUIViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        this.handleClickPageA = this.handleClickPageA.bind(this);
        this.handleClickPageB = this.handleClickPageB.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }
    handleClickPageA(){
        routerPush.emitEvent({to:"/PageA"});
        //(this.props.getRenderProps().store!.storeManager! as IAppStoreManager).routerStore.
    }
    handleClickPageB(){
        routerPush.emitEvent({to:"/PageB"});
    }

    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        const startTime = viewProps.appState!.startTime;

        return (<div>
            App
            <div>
                startTime:{startTime} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleClickPageA}>PageA</button>
                :
                <button onClick={this.handleClickPageB}>PageB</button>
                ||
                <a href="/PageA">PageA</a>
                :
                <a href="/PageB">PageB</a>
            </div>
            <div>
            {viewProps.routerValue ? "show router now" :"show router here but it's empty"}
                
            </div>
            {viewProps.routerValue && React.createElement(RouterView, viewProps.routerValue.getViewProps())}
        </div>);
    }
}