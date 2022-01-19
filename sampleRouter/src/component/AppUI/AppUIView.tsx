import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { AppUIValue } from "./AppUIValue";
import { routerPush } from "dependingStateRouter";
import NavigatorView from "../Navigator/NavigatorView";

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
        const startTime = viewProps.appState!.value.startTime;

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
            {viewProps.navigatorValue ? "show router now" :"show router here but it's empty"}
                
            </div>
            {viewProps.navigatorValue && React.createElement(NavigatorView, viewProps.navigatorValue.getViewProps())}
        </div>);
    }
}