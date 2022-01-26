import { DSEvent, dsLog, DSObjectStore, getPropertiesChanged } from "dependingState";
import { navigatorSetLocation } from "dependingStateRouter";
import { getAppStoreManager } from "~/singletonAppStoreManager";
import { IAppStoreManager } from "~/store/AppStoreManager";
import { pageBStoreBuilder, pageBLoadData, pageBNavigate } from "./PageBActions";
import { PageBValue } from "./PageBValue";

export class PageBStore extends DSObjectStore<PageBValue, "PageBStore">{
    constructor() {
        super("PageBStore", new PageBValue());
        this.setStoreBuilder(pageBStoreBuilder);
    }

    public initializeStore(): void {
        pageBNavigate.listenEvent("navigate", (e)=>{
            getAppStoreManager().navigatorStore.navigateToPageB("");
            pageBLoadData.emitEvent("");
        });

        pageBLoadData.listenEvent("handle pageBLoadData", (e) => {
        });

        this.listenEventValue("a+b=c", (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("nbrA") || properties.has("nbrB")) {
                const pageAValue = e.payload.entity!;
                const pageAValuePC = getPropertiesChanged(pageAValue);
                pageAValuePC.setIf("nbrC", pageAValue.value.nbrA + pageAValue.value.nbrB);
                pageAValuePC.valueChangedIfNeeded("a+b=c");
            }
        });
    }
}
