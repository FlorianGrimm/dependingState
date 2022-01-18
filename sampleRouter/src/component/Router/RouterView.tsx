import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { getAppStoreManager } from "../../singletonAppStoreManager";
import { RouterValue } from "./RouterValue";

type RouterViewProps = {
} & DSUIProps<RouterValue>;

type RouterViewState = {
} & DSUIViewStateBase;

//UIViewState<{}>;

export default class RouterView extends React.Component<RouterViewProps, RouterViewState>{
    constructor(props: RouterViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        // this.handleClickAdd = this.handleClickAdd.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();
        // 

        return (<div>
            <div>
                Router - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                show page here
            </div>
            <div>
                { renderProps.page }
            </div>

        </div>);
    }
}