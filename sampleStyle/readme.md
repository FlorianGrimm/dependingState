# sample style

find the bug

```
npm install
npm run serve
```


o value

    defines the value type

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

-or-

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

```typescript
// file MyValue.ts
import type { DSStateValue } from "dependingState";

export type MyValue = {
    myProp: string;
}

export type MyValueSV = DSStateValue<MyValue>;


o builder

    adds events


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

    public postAttached(): void {
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
    at CalculatorStyleStore.postAttached (CalculatorStyle.ts)
    at AppStoreManager.postAttached (DSStoreManager.ts)
    at ...
```    

the listenEvent requires that the bindValueStore is called.

if you don't find the bug search for "// hint1"
