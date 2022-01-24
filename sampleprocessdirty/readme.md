#samle processdirty

store.processDirty() can be used to calculate the state in dependency of other states.<br>
a little bit like selectors in redux.<br>
 The difference is the selector must compare the incoming state.<br>
 Here you to take care that you set the store dirty - not too often and not too rarely.

## find the bug.

please run:

```
npm install
npm run serve
```


- a store has an flag isDirty
- DSStoreManager.process checks for events, for stores that are dirty and IDSUIStateValue that must be updated.<br/>
    for all store in stores (in the order or DSStoreManager.attach(store) is called), check isDirty and call store.processDirty<>

```typescript
    public processDirty(): void {
        for (const valueStore of this.arrValueStores) {
            if (valueStore.isDirty) {
                valueStore.isDirty = false;
                valueStore.processDirty();
            }
        }
    }
```

- if you want to calculate the state of one store in dependcy of another store you have to listen for this.

a) Option store.listenEmitDirty<br>
    in the target store in initializeStore call listenEmitDirty so each time a value in sourceStore has changed this is called.<br>
    The callback parameter stateValue contains the current stateValue or undefined (if all values has been changed).<br>
    The callback parameter properties contains the names of the changed properties or undefined (if all properties has been changed).<br>
    <br>

```typescript
    sourceStore.listenemitDirtyValue("chain", (stateValue, properties)=>{
        // may be check properties and/or stateValue
        this.isDirty=true;
    });
```

b) Option store.listenDirtyRelated<br>
    in the target store in initializeStore call listenDirtyRelated so each time a value in sourceStore has changed this(store) gets dirty.<br>
    You don't have the possiblity to add an condition.<br>

```typescript
        sourceStore.listenDirtyRelated(this.storeName, this);

```

- overwrite the processDirty to update your state.<br/>
```typescript
    public processDirty(): void {
        super.processDirty();
        const appUIStore = (this.storeManager! as IAppStoreManager).appUIStore;
        const counterStore = (this.storeManager! as IAppStoreManager).counterStore;
        
        const sumPC = getPropertiesChanged(this.stateValue);
        sumPC.setIf("sumValue", appUIStore.stateValue.value.counter + counterStore.stateValue.value.nbrValue);
        sumPC.valueChangedIfNeeded();
    }
```

- Need help? 

Search for "// hint1" within the files *.ts.


- Need more help? 

Search for "// hint2" within the files *.ts.