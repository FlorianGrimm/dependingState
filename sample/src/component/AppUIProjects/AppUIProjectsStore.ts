import { dsIsArrayEqual, DSObjectStore, getPropertiesChanged } from "dependingState";
import { AppViewProjectsUIStateValue } from "./AppUIProjectsValue";
import type { IAppStoreManager } from "../../store/AppStoreManager";

export class AppViewProjectsUIStore extends DSObjectStore<AppViewProjectsUIStateValue, "appViewProjectsUIStore"> {
    constructor(value: AppViewProjectsUIStateValue) {
        super("appViewProjectsUIStore", value);
    }

    public initializeStore(): void {
        super.initializeStore();
        
        const compAUIStore = (this.storeManager! as IAppStoreManager).compAStore;
        //compAUIStore.listenDirtyRelated(this.storeName, this);
        compAUIStore.listenEventAttach(this.storeName, (e) => {
            this.isDirty = true;
        });
        compAUIStore.listenEventDetach(this.storeName, (e) => {
            this.isDirty = true;
        });
        compAUIStore.listenEventValue(this.storeName, (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("ProjectName")) {
                this.isDirty = true;
            }
        });
    }

    public processDirty(): void {
        // const oldCompAUIStates = this.stateValue.value.compAUIStates;
        const compAStore = (this.storeManager! as IAppStoreManager).compAStore;
        const compAUIStates = (Array.from(compAStore.entities.values())
            .sort((a, b) => a.value.ProjectName.localeCompare(b.value.ProjectName))
        );
        const compAUIStatesPC = getPropertiesChanged(this.stateValue);
        compAUIStatesPC.setIf("compAVSs", compAUIStates, (l, r) => {
            return dsIsArrayEqual(l, r, (o, n) => o.value.ProjectId === n.value.ProjectId);
        });
        compAUIStatesPC.valueChangedIfNeeded();
    }
}
