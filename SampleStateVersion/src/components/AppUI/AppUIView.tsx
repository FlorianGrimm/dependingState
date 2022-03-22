import {
    DSUIProps,
    DSUIViewStateBase,
    getPropertiesChanged
} from "dependingState";

import React from "react";
import { getAppStoreManager } from "~/singletonAppStoreManager";

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
        this.handleChangeName = this.handleChangeName.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
        getAppStoreManager().process("handleChangeName", () => {
            const vs = this.props.getRenderProps();
            const pc = getPropertiesChanged(vs);
            pc.setIf("name", e.target.value);
            pc.valueChangedIfNeeded("handleChangeName");
        });
    }

    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();

        return (<div>
            <div>
                AppUI - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                <input value={renderProps.name} onChange={this.handleChangeName} />
            </div>
            <div>
                {renderProps.name}
            </div>
            <div>
                {renderProps.greeting}
            </div>

        </div>);
    }
}
