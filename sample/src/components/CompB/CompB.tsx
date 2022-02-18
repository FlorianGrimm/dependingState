// import { UIProps, StateBase, UIViewState, UIViewStateVersion } from "dependingState";
// import React from "react";

// type CompBViewProps = {};

// type CompBViewState = UIViewState<{}>;

// export class CompBUIState extends StateBase<CompBUIState> {
//     static getInitalState(): CompBUIState {
//         return new CompBUIState();
//     }

//     constructor() {
//         super();
//     }
// }

// export default class CompBView extends React.Component<UIProps<CompBViewProps>, CompBViewState>{
//     constructor(props: UIProps<CompBViewProps>) {
//         super(props);
//         this.state = {
//             stateVersion: this.props.getStateVersion()
//         };
//         this.props.wireStateVersion(this);
//     }
//     componentWillUnmount() {
//         this.props.unwireStateVersion(this);
//     }
//     render(): React.ReactNode {
//         const viewProps = this.props.getViewProps();
//         return (<div>
//             CompB
//         </div>);
//     }
// }
export default function (){};