// hint2 file found
import {
    bindUIComponent,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";

import type { AppUIValue } from "./AppUIValue";
import { timerStopGo } from "./AppUIActions";
import { timerView } from "../Timer/TimerView";
import { getAppStoreManager } from "~/singletonAppStoreManager";

type AppViewProps = {
} & DSUIProps<AppUIValue>;

type AppViewState = {
} & DSUIViewStateBase;

/**
 * create a new AppUIView
 * @param props stateValue.getViewProps()
 */
export function appUIView(props: AppViewProps): React.CElement<AppViewProps, AppUIView> {
    return React.createElement(AppUIView, props)
}
export default class AppUIView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
        super(props);
        this.state = bindUIComponent(this, props).bindHandleAll().setComponentWillUnmount().getState();
    }

    handleClickGo() {
        timerStopGo.emitEvent(true)
    }

    handleClickStop() {
        getAppStoreManager().process("handleClickStop", ()=>{
            timerStopGo.emitEvent(false);
        });
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();

        return (<div>
            App
            <div>
                AppUI - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleClickGo}>go</button>
                <button onClick={this.handleClickStop}>stop</button>
            </div>
            {timerView(getAppStoreManager().timerStore.stateValue.getViewProps())}
            <div>
                <h1>find the bug</h1>
                <div>open F12 - console</div>
                <div>click stop</div>
                <div>can you see the *first* warning?</div>
                <div>DS DSStoreManager emitEvent AppUIStore/timerStopGo called out of process</div>
                <div>Please open the readme.md</div>
            </div>
        </div>);
    }
}