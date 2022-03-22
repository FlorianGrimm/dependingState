import {
    dsLog,
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";

import type { AppUIValue } from "./AppUIValue";

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
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);

        this.handleClickinfo = this.handleClickinfo.bind(this);
        this.handleClickinfo2 = this.handleClickinfo2.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleClickinfo() {
        if (dsLog.enabled) {
            dsLog.info("handleClick", { hello: "world" });
        }
    }

    handleClickinfo2() {
        dsLog.info("handleClick2", { hello: "world" });
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();

        return (<div>
            <div style={{ padding: 10 }}>
                AppUI - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div style={{ padding: 10 }}>
                <button onClick={this.handleClickinfo}>clickinfo</button>
            </div>
            <div style={{ padding: 10 }}>
                <button onClick={this.handleClickinfo2}>clickinfo2</button>
            </div>
            <div>
                Please read the readme.md
            </div>
        </div>);
    }
}
