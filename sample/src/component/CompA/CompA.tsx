import { DSUIViewStateBase } from "dependingState";
import React from "react";

type CompAViewProps = {
    hugo:string;
};

type CompAViewState = {}
// & DSUIViewStateBase
;

/*
export class CompAUIState extends StateBase<CompAUIState> {
    static getInitalState(): CompAUIState {
        return new CompAUIState();
    }

    constructor() {
        super();
    }
}
*/
export default class CompAView extends React.Component<CompAViewProps, CompAViewState>{
    constructor(props: CompAViewProps) {
        super(props);
        // this.state = {
        //     stateVersion: this.props.getStateVersion()
        // };
        // this.props.wireStateVersion(this);
    }
    // componentWillUnmount() {
    //     this.props.unwireStateVersion(this);
    // }
    render(): React.ReactNode {
        // const viewProps = this.props.getViewProps();
        // return (<div>
        //     CompA - StateVersion: { this.props.getStateVersion() }
        // </div>);
        return (<div>
            CompA - hugo: { this.props.hugo }
        </div>);
    }
}