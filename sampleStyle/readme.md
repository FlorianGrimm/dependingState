# sample style

find the bug

please run:

```
npm install
npm run serve
```


o value

define the value type

3 ways to do this.


a) poco object
```typescript
// file MyValue.ts
import type { DSStateValue } from "dependingState";

export type MyValue = {
    myProp: string;
}

export type MyValueSV = DSStateValue<MyValue>;
```

-or-

b) simple class

```typescript
// file MyValue.ts
import type { DSStateValue } from "dependingState";


export class MyValue {
    myProp: string;
    constructor() {
        this.myProp = "";
    }
}

export type MyValueSV = DSStateValue<MyValue>;
```

-or-

c) DSStateValueSelf to save memory

you need only 1 object instead of 2.

hint: this.value === this

```typescript
// file MyValue.ts
import { DSStateValueSelf } from "dependingState";

export class MyValue extends DSStateValueSelf<MyValue> {
    myProp: string;
    constructor() {
        super();
        this.myProp = "";
    }
}
```

o builder

the builder define the 

o name 
o events

if you don't have events you don't need this.


```typescript
// file MyBuilder.ts
import { storeBuilder } from "dependingState";
import type { MyStore } from "./MyStore";
import type { MyValue } from "./MyValue";
export const myBuilder = storeBuilder<MyStore['storeName']>("MyStore");
export const myAction = myBuilder.createAction<string>("myAction");
```

o store

    the store contains the logic

    - setStoreBuilder binds the actions to this store
    - listenEvent binds the logic (the listener)
    - processDirty runs if isDirty was set.
    - isDirty can be set by any listener.

```typescript
// file MyStore.ts
import { DSObjectStore, getPropertiesChanged, hasChangedProperty } from "dependingState";
import { myStoreBuilder, myAction } from "./MyActions";
import { MyValue } from "./MyValue";

export class MyStore extends DSObjectStore<MyValue, "MyStore">{
    constructor() {
        super("MyStore", new MyValue());
        this.setStoreBuilder(myStoreBuilder);
    }

    public initializeStore(): void {
        myAction.listenEvent("handle myAction", (e) => {
            const myValue = e.payload.entity;
            
            // calculate
            const newValue = (myValue || "").trim();

            const calculatorValuePC = getPropertiesChanged(calculatorValue);            
            calculatorValuePC.setIf("myProp", newValue);
            calculatorValuePC.valueChangedIfNeeded();
        });
    }
}
```

o AppStoreManager

add the new store in the AppStoreManager

The order of the attach calls matters.
In this order the processDirty is called.
So you can relay on the previous ones to be 'clean'.

```typescript
import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppStore } from "./AppState";
import type { AppUIStore } from "~/components/AppUI/AppUIStore";
import type { MyStore } from "src/components/My/MyStore";

export interface IAppStoreManager extends IDSStoreManager {
    appStore: AppStore;
    appUIStore:AppUIStore;
    myStore: MyStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appStore: AppStore,
        public appUIStore:AppUIStore,
        public myStore: MyStore,
    ) {
        super();
        this.attach(appStore);
        this.attach(appUIStore);
        this.attach(myStore);
    }
}
```
o emit the event

```typescript
import { myAction } from "./MyActions";

setTimeout(()=>{
    myAction('     Hello World!    ');
},1000);
```


o the bug in this sample

```
index.ts:58 Error while app boots. Error: DS DSStoreAction.listenEvent valueStore is not set CalculatorStyleStore - Did you call builder.bindValueStore(this) in the constructor?
    at DSStoreAction.listenEvent (DSStoreBuilder.ts)
    at CalculatorStyleStore.initializeStore (CalculatorStyle.ts)
    at AppStoreManager.initializeStore (DSStoreManager.ts)
    at ...
```    

the listenEvent requires that the bindValueStore is called.

if you don't find the bug search for "// hint1"              <br>
if you still don't find the bug search for "// hint2"
