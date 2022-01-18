import { dsIsArrayEqual, DSObjectStore, getPropertiesChanged } from "dependingState";
import { AppViewProjectsUIStateValue } from "./AppUIProjectsValue";
import type { IAppStoreManager } from "../../store/AppStoreManager";

export class AppViewProjectsUIStore extends DSObjectStore<AppViewProjectsUIStateValue, AppViewProjectsUIStateValue, "appViewProjectsUIStore"> {
    constructor(value: AppViewProjectsUIStateValue) {
        super("appViewProjectsUIStore", value);
    }

    public postAttached(): void {
        const compAUIStore = (this.storeManager! as unknown as IAppStoreManager).compAStore;
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

        // compAUIStore.listenEventValue(this.storeName, (e)=>{
        //     const key = e.payload.entity.ProjectId;
        // });
    }

    public processDirty(): void {
        const oldCompAUIStates = this.stateValue.compAUIStates;
        const compAUIStore = (this.storeManager! as unknown as IAppStoreManager).compAStore;
        const compAUIStates = (Array.from(compAUIStore.entities.values())
            .sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
        );
        const compAUIStatesPC = getPropertiesChanged(this.stateValue);
        compAUIStatesPC.setIf("compAUIStates", compAUIStates, (l, r) => {
            return dsIsArrayEqual(l, r, (o, n) => o.ProjectId === n.ProjectId);
        });
        compAUIStatesPC.valueChangedIfNeeded();
    }
}
