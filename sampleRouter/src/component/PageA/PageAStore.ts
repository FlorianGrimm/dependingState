import {
    DSObjectStore,
    getPropertiesChanged,
    hasChangedProperty,
    DSValueChanged,
    getPropertiesSet
} from "dependingState";
import { navigatorSetLocation } from "dependingStateRouter";
import { getAppStoreManager } from "~/singletonAppStoreManager";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { NavigatorValue } from "../Navigator/NavigatorValue";
import {
    pageAStoreBuilder,
    pageALoadData,
    pageANavigate
} from "./PageAActions";
import { PageAValue } from "./PageAValue";

const propertiesSetisLoading = getPropertiesSet<PageAValue>(["isLoading"]);
export class PageAStore extends DSObjectStore<PageAValue, "PageAStore">{
    pageChanged: DSValueChanged<string>;
    constructor() {
        super("PageAStore", new PageAValue());
        this.setStoreBuilder(pageAStoreBuilder);
        this.pageChanged = new DSValueChanged();
    }

    public initializeStore(): void {
        const navigatorStore = (this.storeManager! as IAppStoreManager).navigatorStore;

        pageANavigate.listenEvent("handle pageANavigate", (e) => {
            getAppStoreManager().navigatorStore.navigateToPageA({ a: 1, b: 11 });
            pageALoadData.emitEvent("");
        });

        pageALoadData.listenEvent("handle pageALoadData", (e) => {
            this.stateValue.value.isLoading = true;
            this.stateValue.valueChanged("loading...", propertiesSetisLoading);

            /*
            const p = new Promise<void>((resolve) => {
                setTimeout(() => {
                    this.stateValue.value.isLoading = false;
                    this.stateValue.valueChanged("loadingDone", propertiesSetisLoading);
                    resolve();
                }, 2000);
            });
            return p;
            */
            setTimeout(() => {
                this.stateValue.value.isLoading = false;
                this.stateValue.valueChanged("loadingDone", propertiesSetisLoading);
            }, 250);
        });

        navigatorStore.listenEventValue("handle pageChanged", (e) => {
            if (hasChangedProperty<NavigatorValue>(e.payload.properties, "page")) {
                if (this.pageChanged.setValue(e.payload.entity.value.page)) {
                    pageALoadData.emitEvent("any");
                }
            }
        });

        this.listenEventValue("a+b=c", (e) => {
            const properties = e.payload.properties;
            if (hasChangedProperty(e.payload.properties, "nbrA", "nbrB")) {
                const pageAValue = e.payload.entity!;
                const pageAValuePC = getPropertiesChanged(pageAValue);
                pageAValuePC.setIf("nbrC", pageAValue.value.nbrA + pageAValue.value.nbrB);
                pageAValuePC.valueChangedIfNeeded("a+b=c");
            }
        });
    }
}
