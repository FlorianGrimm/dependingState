import { DSObjectStore, getPropertiesChanged, hasChangedProperty } from "dependingState";
import { pageBStoreBuilder, doSomething } from "./PageBActions";
import { PageBValue } from "./PageBValue";

export class PageBStore extends DSObjectStore<PageBValue, "PageBStore">{
    constructor() {
        super("PageBStore", new PageBValue());
        this.setStoreBuilder(pageBStoreBuilder);
    }

    public initializeStore(): void {
        doSomething.listenEvent("handle doSomething", (e) => {
            const stateValuePC = getPropertiesChanged(this.stateValue);
            stateValuePC.setIf("myPropA", "Hello World");
            stateValuePC.valueChangedIfNeeded();
        });
        this.listenEventValue("listen for myPropA", (e) => {
            const properties = e.payload.properties;
            if (hasChangedProperty(properties, "myPropA")) {
                const entityVS = e.payload.entity;
                const myPropA = entityVS.value.myPropA;
                const pageAValuePC = getPropertiesChanged(entityVS);
                pageAValuePC.setIf("myPropB", `${myPropA}::${myPropA}`);
                pageAValuePC.valueChangedIfNeeded();
            }
        });
    }

    // public processDirty(): boolean {
    //     let result=super.processDirty();
    //     return  result;
    // }
}
