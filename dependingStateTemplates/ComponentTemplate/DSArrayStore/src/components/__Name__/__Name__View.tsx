import {
    DSObjectStore,
    DSUIProps,
    DSUIViewStateBase,
    bindUIComponent
} from "dependingState";
import React from "react";

import { countUp } from "./__Name__Actions";

import { getAppStoreManager } from "~/singletonAppStoreManager";
//import OtherView from "../Other/OtherView";
import { __Name__Value } from "./__Name__Value";

type __Name__ViewProps = {
} & DSUIProps<__Name__Value>;

type __Name__ViewState = {
} & DSUIViewStateBase;

/**
 * create a new __Name__View
 * @param props stateValue.getViewProps()
 */
export function timesheetView(props: __Name__ViewProps): React.ReactNode {
    return React.createElement(__Name__View, props)
}
export default class __Name__View extends React.Component<__Name__ViewProps, __Name__ViewState>{
    constructor(props: __Name__ViewProps) {
        super(props);
        this.state = bindUIComponent(this, props)
            .bindHandleAll()
            .setComponentWillUnmount()
            .getState();
    }

    handleAddClick() {
        getAppStoreManager().process("handleAddClick", () => { });
        countUp.emitEvent(undefined);
    }

    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        const language = (viewProps.appState?.language) || "";
        // const appViewProjectsUIStateValue = viewProps.appViewProjectsUIStateValue;

        return (<div>
            App
            <div>
                language:{language} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleAddClickAdd}>add</button>
            </div>
            { /* otherUIStateValue && React.createElement(OtherView, otherUIStateValue.getViewProps()) */}
        </div>);
    }
}
