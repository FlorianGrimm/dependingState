import { DSEvent, dsLog, DSObjectStore, getPropertiesChanged } from "dependingState";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { pageAUIStoreBuilder, doSomething } from "./PageAActions";
import { PageAValue } from "./PageAValue";

export class PageAStore extends DSObjectStore<PageAValue, PageAValue, "PageAStore">{
    constructor() {
        super("PageAStore", new PageAValue());
        this.setStoreBuilder(pageAUIStoreBuilder);

    }

    public postAttached(): void {
        doSomething.listenEvent("handle doSomething", (e) => {
        });
        this.listenEventValue("a+b=c", (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("nbrA") || properties.has("nbrB")) {
                const pageAValue = e.payload.entity;
                const pageAValuePC = getPropertiesChanged(pageAValue);
                pageAValuePC.setIf("nbrC", pageAValue.nbrA + pageAValue.nbrB);
                pageAValuePC.valueChangedIfNeeded();
            }
        });
    }
}
