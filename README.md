# dependingState

state mangement for a app that uses react.

goals

o fast
o simple and not too much magic
o a little bit like redux


## overview
```
DSStoreManager -> DSValueStore -> DSStateValue -> DSUIStateValue -> React.Component
```
o DSStoreManager knows all DSValueStore-s, process events
o DSValueStore contains the logic and references the current state in one or more DSStateValue(s).
    o DS
o DSStateValue references the a poco object (may be transported over the wire) and may reference a DSUIStateValue.
    o DSStateValueSelf is a DSStateValue with properties within it (since it is not intended to de-serializable).
o DSUIStateValue interact with react
    o DSStateValue.getUIStateValue() returns a DSUIStateValue
    o getViewProps() returns a object (DSUIProps) that is fast to compare this is the *react prop*.
    o getViewProps().getRenderProps() returns the 
    o DSStateValue.getViewProps() shortcut for DSStateValue.getUIStateValue().getViewProps()

## Code Snippets
React.Component
```typescript
import React from "react";
import { DSUIProps, DSUIViewStateBase, getPropertiesChanged } from "dependingState";
import type { MyComponentValue } from "./MyComponentValue";
import { myaction } from "./MyComponentActions";

type MyComponentViewProps = DSUIProps<MyComponentValue>;

type MyComponentViewState = {
} & DSUIViewStateBase;

export default class MyComponentView extends React.Component<MyComponentViewProps, MyComponentViewState>{
    constructor(props: MyComponentViewProps) {
        super(props);
        this.state = {
            stateVersion: this.props.getStateVersion()
        };
        this.props.wireStateVersion(this);
        this.handleMyAction = this.handleMyAction.bind(this);
    }

    componentWillUnmount() {
        this.props.unwireStateVersion(this);
    }

    handleMyAction() {
        console.group("myaction");
        try {
            myaction.emitEvent(this.props.getRenderProps());
        } finally {
            console.groupEnd();
        }
    }
    render(): React.ReactNode {
        const viewProps = this.props.getRenderProps();
        return (<div>
            {viewProps.myprop}
            <button onClick={this.handleMyAction}>myaction</button>
        </div>);
    }
}
```

## sample

sampleSimple
sampleRouter

# 

cd dependingState && npm install && cd ..
cd dependingStateRouter && npm install && cd ..
cd sample && npm install && cd ..
cd sampleRouter && npm install && cd ..