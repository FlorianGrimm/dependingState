import {
    DSObjectStore,
    getPropertiesChanged,
    hasChangedProperty,
    DSValueChanged
} from "dependingState";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { NavigatorValue } from "../Navigator/NavigatorValue";
import {
    pageAStoreBuilder,
    pageALoadData
} from "./PageAActions";
import { PageAValue } from "./PageAValue";

export class PageAStore extends DSObjectStore<PageAValue, "PageAStore">{
    pageChanged: DSValueChanged<string>;
    constructor() {
        super("PageAStore", new PageAValue());
        this.setStoreBuilder(pageAStoreBuilder);
        this.pageChanged = new DSValueChanged();
    }

    public initializeStore(): void {
        const navigatorStore = (this.storeManager! as IAppStoreManager).navigatorStore;

        navigatorStore.listenEventValue("pageChanged", (e) => {
            if (hasChangedProperty<NavigatorValue>(e.payload.properties, "page")) {
                if (this.pageChanged.setValue(e.payload.entity.value.page)){
                    pageALoadData.emitEvent("any")
                }
            }
        });

        this.listenEventValue("a+b=c", (e) => {
            const properties = e.payload.properties;
            if (hasChangedProperty(e.payload.properties, "nbrA", "nbrB")) {
                const pageAValue = e.payload.entity!;
                const pageAValuePC = getPropertiesChanged(pageAValue);
                pageAValuePC.setIf("nbrC", pageAValue.value.nbrA + pageAValue.value.nbrB);
                pageAValuePC.valueChangedIfNeeded();
            }
        });

        pageALoadData.listenEvent("do nothing",()=>{

        });
    }
}
