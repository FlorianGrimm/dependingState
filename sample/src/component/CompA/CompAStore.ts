import { DSEntityStore, DSEvent, dsLog, getPropertiesChanged } from "dependingState";
import { Project } from "../../types";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { compAUIStoreBuilder, changeProjectName } from "./CompAActions";
import { CompAValue } from "./CompAValue";

export class CompAStore extends DSEntityStore<CompAValue, string,  CompAValue, "CompAStore">{
    constructor() {
        super("CompAStore", {
            create: (item: CompAValue) => item,
            getKey: (item: CompAValue) => item.ProjectId
        });
        this.setStoreBuilder(compAUIStoreBuilder);
    }

    public postAttached(): void {
        var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
        projectStore.listenEventAttach(this.storeName, (e) => {
            const project = e.payload.entity.value;
            const compAValue = new CompAValue(project)
            this.attach(project.ProjectId, compAValue);
            compAValue.nbrC = compAValue.nbrA + compAValue.nbrB;
            this.isDirty = true;
        });
        projectStore.listenEventDetach(this.storeName, (e) => {
            this.detach(e.payload.key);
            this.isDirty = true;
        });
        projectStore.listenEventValue(this.storeName, (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("ProjectName")) {
                const key = e.payload.entity.value.ProjectId;
                var compAUIState = this.get(key);
                if (compAUIState) {
                    const compAUIStatePC = getPropertiesChanged(compAUIState.value);
                    compAUIStatePC.setIf("ProjectName", e.payload.entity.value.ProjectName);
                    compAUIStatePC.valueChangedIfNeeded();
                } else {
                    dsLog.warn(`compAUIState wiht ${key} not found.`)
                }
            }
        });
        //<DSEvent<Project>>
        changeProjectName.listenEvent("handle ola", (e) => {
            var projectStore = (this.storeManager! as IAppStoreManager).projectStore;
            const prj = projectStore.get(e.payload.ProjectId);
            if (prj) {
                const prjPC = getPropertiesChanged(prj);
                prjPC.setIf("ProjectName", (new Date()).toISOString());
                prjPC.valueChangedIfNeeded();
            }
        });
        this.listenEventValue("a+b=c", (e) => {
            const properties = e.payload.properties;
            if (properties === undefined || properties.has("nbrA") || properties.has("nbrB")) {
                const compAValue = e.payload.entity;
                const compAValuePC = getPropertiesChanged(compAValue);
                compAValuePC.setIf("nbrC", compAValue.nbrA + compAValue.nbrB);
                compAValuePC.valueChangedIfNeeded();
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

    public processDirty(): void {
        this.emitDirty(null!);
    }
    // public processDirty(): void {
    //     const compAUIStates = (Array.from(this.entities.values())
    //         .sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
    //     );
    //     this.compAUIStates = compAUIStates;
    //     this.compAUIStates.forEach((item)=>item.valueChanged())
    // }
}
