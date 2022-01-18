import { DSEvent, dsLog, DSObjectStore, getPropertiesChanged } from "dependingState";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { pageAUIStoreBuilder, doSomething } from "./PageBActions";
import { PageBValue } from "./PageBValue";

export class PageBStore extends DSObjectStore<PageBValue, PageBValue, "PageBStore">{
    constructor() {
        super("PageBStore", new PageBValue());
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
