import {
    dsLog,
    DSObjectStore,
    getPropertiesChanged
} from "dependingState";
import type { IAppStoreManager } from "~/store/AppStoreManager";
import { pageALoadData, pageANavigate } from "../PageA/PageAActions";
import { pageBLoadData, pageBNavigate } from "../PageB/PageBActions";
import { appUIStoreBuilder, useNavigatorA, useNavigatorB } from "./AppUIActions";
import { AppUIValue } from "./AppUIValue";

export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        value.startTime = (new Date()).toISOString();
        this.setStoreBuilder(appUIStoreBuilder);
    }

    public initializeStore(): void {
        super.initializeStore();

        useNavigatorA.listenEvent("useNavigatorA", (e)=>{
            pageANavigate.emitEvent("");
        });
        useNavigatorB.listenEvent("useNavigatorB", (e)=>{
            pageBNavigate.emitEvent("");
        });

        // const navigatorStore = (this.storeManager! as IAppStoreManager).navigatorStore;

        // navigatorStore.listenValueChanged("AppUIStore listen to router", (stateValue, properties) => {
        //     if (this.isDirty) { return; }
        //     if ((properties == undefined) || properties.has("page")) {
        //         this.setDirty("page changed");
        //     }
        // });

        // this.stateValue.value.navigatorValue = navigatorStore.stateValue
    }
}