import {
    DSUIProps,
    DSUIViewStateBase,
    bindUIComponent
} from "dependingState";

import React from "react";

import { countUp } from "./__Name__Actions";

import { getAppStoreManager } from "~/singletonAppStoreManager";
//import OtherView from "../Other/OtherView";
import type { __Name__Value } from "./__Name__Value";

type __Name__ViewProps = {
} & DSUIProps<__Name__Value>;

type __Name__ViewState = {
} & DSUIViewStateBase;

/**
 * create a new __Name__View
 * @param props stateValue.getViewProps()
 */
export function __name__View(props: __Name__ViewProps): React.ReactNode {
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
        const renderProps = this.props.getRenderProps();

        return (<div>
            App
            <div>
                __Name__ - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <button onClick={this.handleAddClick}>add</button>
            </div>

        </div>);
    }
}
