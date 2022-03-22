import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";

import React from "react";

import type { SumValue } from "./SumValue";

type AppViewProps = {
} & DSUIProps<SumValue>;

type AppViewState = {
} & DSUIViewStateBase;

const oddStyle: React.CSSProperties = {
    backgroundColor: "orange",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};
const evenStyle: React.CSSProperties = {
    backgroundColor: "yellow",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};

/**
 * create a new SumView
 * @param props stateValue.getViewProps()
 */
export function sumView(props: AppViewProps): React.ReactNode {
    return React.createElement(SumView, props)
}
export default class SumView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }


    render(): React.ReactNode {
        const { sumValue } = this.props.getRenderProps();
        const rootStyle = (((sumValue | 0) % 2) == 0) ? evenStyle : oddStyle;
        return (<div style={rootStyle}>
            Sum: {sumValue}
        </div>);
    }
}
