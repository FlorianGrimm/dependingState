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
import { AppViewValue } from "./AppViewValue";



type AppViewProps = {
    //stateRoot: TStateRootAppStates;
} & DSUIProps<AppViewValue>;

type AppViewState = {

} & DSUIViewStateBase;

//UIViewState<{}>;

export default class AppView extends React.Component<AppViewProps, AppViewState>{
    constructor(props: AppViewProps) {
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
        const viewProps = this.props.getRenderProps();
        const language = "Todo"
        return (<div>
            App
            <div>
                language:{language} - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                show page here
            </div>

        </div>);
    }
}