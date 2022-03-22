import { dsIsArrayEqual, DSObjectStore, getPropertiesChanged } from "dependingState";
import { AppViewProjectsUIStateValue } from "./AppUIProjectsValue";
import type { IAppStoreManager } from "~/services/AppStoreManager";

export class AppViewProjectsUIStore extends DSObjectStore<AppViewProjectsUIStateValue, "AppViewProjectsUIStore"> {
    constructor(value: AppViewProjectsUIStateValue) {
        super("AppViewProjectsUIStore", value);
    }

    public initializeStore(): void {
        super.initializeStore();

        const compAUIStore = (this.storeManager! as IAppStoreManager).compAStore;
        //compAUIStore.listenCleanedUpRelated(this.storeName, this);
        compAUIStore.listenEventAttach(this.storeName, (e) => {
            this.setDirty("listenEventAttach");
        });
        compAUIStore.listenEventDetach(this.storeName, (e) => {
            this.setDirty("listenEventDetach");
        });
        compAUIStore.listenEventValue(this.storeName, (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("ProjectName")) {
                this.setDirty("listenEventValue");
            }
        });
    }

    public processDirty(): boolean {
        let result = super.processDirty();
        // const oldCompAUIStates = this.stateValue.value.compAUIStates;
        const compAStore = (this.storeManager! as IAppStoreManager).compAStore;
        const compAUIStates = (Array.from(compAStore.entities.values())
            .sort((a, b) => a.value.ProjectName.localeCompare(b.value.ProjectName))
        );
        const compAUIStatesPC = getPropertiesChanged(this.stateValue);
        compAUIStatesPC.setIf("compAVSs", compAUIStates, (l, r) => {
            return dsIsArrayEqual(l, r, (o, n) => o.value.ProjectId === n.value.ProjectId);
        });
        if (compAUIStatesPC.valueChangedIfNeeded("AppViewProjectsUIStore.processDirty")) { result = true; }
        return result;
    }
}
