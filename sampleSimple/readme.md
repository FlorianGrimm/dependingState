#samle simple

find the bug.

please run:

```
npm install
npm run serve
```
- Why does count-down work and count-up not?

- the AppUIValue defines properties <br/>
    see src\component\AppUI\AppUIValue.ts

```typescript
    counter: number;
    clicks: number;
```

- the AppUIView is a React.Component that renders the AppUIValue and the button triggers the events (like redux actions).<br/>
    see src\component\AppUI\AppUIView.tsx

- the builder is used to define events/actions for the store.<br/>
    see src\component\AppUI\AppUIActions.ts<br/>
    (if the store don't need events the builder is not required)
```typescript
import { storeBuilder } from "dependingState";
import type { AppUIStore } from "./AppUIStore";

export const appUIStoreBuilder = storeBuilder<AppUIStore['storeName']>("AppUIStore");
export const countDown = appUIStoreBuilder.createAction<undefined>("countDown");
export const countUp = appUIStoreBuilder.createAction<undefined>("countUp");
```

- if the builder defines events for the store the store has to call bindValueStore.<br/>
    see src\component\AppUI\AppUIStore.ts <br/>
```typescript
export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        appUIStoreBuilder.bindValueStore(this);
    }
}
```

- the AppUIStore is a store with an single object - it's the purpuse of DSObjectStore. <br>
    - the appUIStore.stateValue references one IDSStateValue<AppUIValue>
    - the appUIStore.stateValue.value references one AppUIValue

- all stores (extending the DSValueStore) can listen to events. (To their own or to others.). In the method initializeStore() call listenEvent registers a callback.
```typescript
    public initializeStore(): void {
        super.initializeStore();

        countDown.listenEvent("countDown",(e)=>{
            console.log("countDown was emitted.")
        });      
    }
```

- if you change a value you have to call stateValue.valueChanged() <br>
their is  is a helper reached via getPropertiesChanged()
  
```typescript
    public initializeStore(): void {
        super.initializeStore();

        countDown.listenEvent("countDown",(e)=>{
            console.log("countDown was emitted.")
            this.stateValue.value.counter--;
            this.stateValue.value.clicks++;
            this.stateValue.valueChanged();
            // valueChanged triggers the update of the ui or depending objects
        });      
    }
```

 -or- <br>

 ```typescript
     getPropertiesChanged(this.stateValue);
    stateValuePC.setIf("answer", 42);

    // conditionally call valueChanged
    stateValuePC.valueChangedIfNeeded();
```

- Why does count-down work and count-up not?

- Need help? 

Search for "// hint1" within the files *.ts.