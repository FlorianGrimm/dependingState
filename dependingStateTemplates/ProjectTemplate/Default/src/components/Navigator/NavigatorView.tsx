import {
    DSUIProps,
    DSUIViewStateBase
} from "dependingState";
import React from "react";
import { getAppStoreManager } from "~/singletonAppStoreManager";
import { pageAView } from "../PageA/PageAView";
import { pageBView } from "../PageB/PageBView";
import { NavigatorValue } from "./NavigatorValue";

type NavigatorViewProps = {
} & DSUIProps<NavigatorValue>;

type NavigatorViewState = {
} & DSUIViewStateBase;

export function navigatorView(props: NavigatorViewProps) {
    return React.createElement(NavigatorView, props);
}

export default class NavigatorView extends React.Component<NavigatorViewProps, NavigatorViewState>{
    constructor(props: NavigatorViewProps) {
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
        const renderProps = this.props.getRenderProps();
        // 
        let placeholderPage: any | undefined;
        switch (renderProps.page) {
            case "home":
                placeholderPage = "Home sweet home";
                break;
            case "pageA":
                placeholderPage = pageAView(getAppStoreManager().pageAStore.stateValue.getViewProps());
                break;
            case "pageB":
                placeholderPage = pageBView(getAppStoreManager().pageBStore.stateValue.getViewProps());
                break;
            case "pageError":
                placeholderPage = "Error"
            default:
                placeholderPage = "Unknown Page";
                break;
        }
        return (<div>
            <div>
                Navigator - StateVersion: {this.props.getStateVersion()} - dt:{(new Date()).toISOString()}
            </div>
            <div>
                show page here
            </div>
            <div>
                {placeholderPage}
            </div>

        </div>);
    }
}