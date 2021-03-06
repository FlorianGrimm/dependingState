import { DSEntityStore, DSEvent, dsLog, getPropertiesChanged } from "dependingState";
import { Project } from "../../types";
import { IAppStoreManager } from "../../services/AppStoreManager";
import { compAUIStoreBuilder, changeProjectName } from "./CompAActions";
import { CompAValue } from "./CompAValue";

export class CompAStore extends DSEntityStore<string, CompAValue, "CompAStore">{
    constructor() {
        super("CompAStore", {
            create: (item: CompAValue) => item,
            getKey: (item: CompAValue) => item.ProjectId
        });
        this.setStoreBuilder(compAUIStoreBuilder);
    }

    public initializeStore(): void {
        super.initializeStore();
        var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
        projectStore.listenEventAttach(this.storeName, (e) => {
            const project = e.payload.entity.value;
            const compAValue = new CompAValue(project)
            this.attach(project.ProjectId, compAValue);
            compAValue.nbrC = compAValue.nbrA + compAValue.nbrB;
            this.setDirty("listenEventAttach");
        });
        projectStore.listenEventDetach(this.storeName, (e) => {
            this.detach(e.payload.key);
            this.setDirty("listenEventDetach");
        });
        projectStore.listenEventValue(this.storeName, (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("ProjectName")) {
                const key = e.payload.entity!.value.ProjectId;
                var compAUIState = this.get(key);
                if (compAUIState) {
                    const compAUIStatePC = getPropertiesChanged(compAUIState.value);
                    compAUIStatePC.setIf("ProjectName", e.payload.entity!.value.ProjectName);
                    compAUIStatePC.valueChangedIfNeeded("ProjectName changed");
                } else {
                    dsLog.warn(`compAUIState wiht ${key} not found.`)
                }
            }
        });

        changeProjectName.listenEvent("handle changeProjectName", (e) => {
            var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
            const prj = projectStore.get(e.payload.ProjectId);
            if (prj) {
                const prjPC = getPropertiesChanged(prj);
                prjPC.setIf("ProjectName", (new Date()).toISOString());
                prjPC.valueChangedIfNeeded("handle changeProjectName");
            }
        });
        this.listenEventValue("a+b=c", (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("nbrA") || properties.has("nbrB")) {
                const compAValue = e.payload.entity!;
                const compAValuePC = getPropertiesChanged(compAValue);
                compAValuePC.setIf("nbrC", compAValue.value.nbrA + compAValue.value.nbrB);
                compAValuePC.valueChangedIfNeeded("a+b=c");
            }
        });
        /*
        this.listenEvent<DSEvent<Project>>(this.storeName, "hugo", (e) => {
            var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
            const prj = projectStore.get(e.payload.ProjectId);
            if (prj) {
                prj.value.ProjectName = (new Date()).toISOString();
                prj.valueChanged();
            }
        });
        */
    }

    public processDirty(): boolean {
        let result = super.processDirty();
        return true;
    }
    // public processDirty(): void {
    //     this.emitDirty();
    // }
    // public processDirty(): void {
    //     const compAUIStates = (Array.from(this.entities.values())
    //         .sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
    //     );
    //     this.compAUIStates = compAUIStates;
    //     this.compAUIStates.forEach((item)=>item.valueChanged())
    // }
}
