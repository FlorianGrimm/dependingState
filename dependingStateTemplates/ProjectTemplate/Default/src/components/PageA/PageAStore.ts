import { DSObjectStore, getPropertiesChanged, hasChangedProperty } from "dependingState";
import { pageAStoreBuilder, doSomething } from "./PageAActions";
import { PageAValue } from "./PageAValue";

export class PageAStore extends DSObjectStore<PageAValue, "PageAStore">{
    constructor() {
        super("PageAStore", new PageAValue());
        this.setStoreBuilder(pageAStoreBuilder);
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
