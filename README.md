# dependingState

state mangement for a app that uses react.

goals

o fast
o simple and not too much magic
o a little bit like redux

## Tutorial - Find the bug

I asume you have npm and vs code installed - or any other editor you like more.

1) SampleTimer<br>
    - (in vs code) open the folder SampleTimer 
    - open the readme.md (File ContextMenu OpenPreview)
    - follow the instructions

2) sampleLog
3) sampleStyle
4) sampleSimple
5) sampleRouter

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

// optional
export function myComponentView(props: MyComponentViewProps) {
    return React.createElement(MyComponentView, props);
}

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
        myaction.emitEvent(this.props.getRenderProps().myprop);
    }
    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();
        return (<div>
            {renderProps.myprop}
            <button onClick={this.handleMyAction}>myaction</button>
        </div>);
    }
}
```

embedding a child element.

```typescript
    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();
        const { myChildValue } = renderProps;
        return (<div>
            rendering MyChildView now:
            { React.createElement(MyChildView, myChildValue.getViewProps())}
        </div>);
        // looks wild, but works nicely
    }
```

-or- if you added myComponentView
```typescript
    render(): React.ReactNode {
        const renderProps = this.props.getRenderProps();
        const { myChildValue } = renderProps;
        return (<div>
            rendering MyChildView now:
            { myComponentView(myChildValue.getViewProps()) }
        </div>);
        // looks wild, but works nicely
    }
```
currently no hooks - an I'm not sure if I like hooks, but anyway I'm investingating for them.

## sample

sampleSimple
sampleRouter

# install

```

cd dependingState
npm install
cd ..

cd dependingStateRouter
npm install
cd ..

cd sample
npm install
cd ..

cd sampleSimple
npm install
cd ..

cd sampleStyle
npm install
cd ..

cd sampleRouter
npm install
cd ..

```

# compile

```

cd dependingState
npx tsc -noEmit
cd ..

cd dependingStateRouter
npx tsc -noEmit
cd ..

cd sample
npx tsc -noEmit
cd ..

cd sampleSimple
npx tsc -noEmit
cd ..

cd sampleStyle
npx tsc -noEmit
cd ..

cd sampleRouter
npx tsc -noEmit
cd ..

```