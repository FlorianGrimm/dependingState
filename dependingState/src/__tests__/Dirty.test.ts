import { DSEntityStore } from "../DSValueStore";
import {
    DSMapStore,
    DSStoreManager,
    DSEventValue,
    DSEventAttach,
    DSStateValue
} from "../index";
import { DSEventHandler, DSPayloadEntity } from "../types";

class Project {
    constructor(
        public ProjectId: string = "",
        public ProjectName: string = ""
    ) {
    }
}

class ProjectStore extends DSEntityStore<string, Project>{
    constructor(storeName: string) {
        super(storeName, ProjectStore.create, ProjectStore.getKey) ;
    }

    public static create(project: Project): DSStateValue<Project> {
        return new DSStateValue<Project>(project);
    }
    public static getKey(project: Project): string {
        return project.ProjectId;
    }
}

class ProjectUI extends DSStateValue<ProjectUI>{
    t:number;
    constructor(
        public projectValue:DSStateValue<Project>
    ) {
        super(null!);
        this.value = this;
        this.t=0;
    }
    
    public get key() : string {
        return this.projectValue.value.ProjectId;
    }
}

class DSStoreManagerDirty extends DSStoreManager {
    constructor(
        public project: ProjectStore,
        public projectUIStore:DSMapStore<string, ProjectUI, ProjectUI>
    ) {
        super();
        this.attach(project);
        this.attach(projectUIStore); 
    }
}

test('Dirty', async () => {
    const projectStore = new ProjectStore("project");
    const projectUIStore = new DSMapStore<string, ProjectUI>("projectUI");
    const storeManager = new DSStoreManagerDirty(projectStore, projectUIStore);
    projectStore.listenEvent<DSPayloadEntity<Project>>({storeName:"project", event:"attach"}, (projectValue)=>{
        projectUIStore.attach(projectValue.payload.entity.value.ProjectId, new ProjectUI(projectValue.payload.entity))
    });
    projectStore.listenDirty((project)=>{
        const projectUI = projectUIStore.get(project.value.ProjectId) as (ProjectUI|undefined);
        if (projectUI){
            projectUI.isDirty=true;
            projectUIStore.isDirty=true;
            projectUI.t=projectUI.t+1;
            //projectUI.valueChanged();
            //if (projectUI.isDirty){}
        }
    });

    // init
    projectStore.set(new Project("1", "one"));
    expect(projectStore.get("1")!.value.ProjectName).toBe("one");
    projectStore.setMany([new Project("2", "two"), new Project("3", "three")]);
    expect(projectStore.get("2")!.value.ProjectName).toBe("two");
    expect(projectStore.get("3")!.value.ProjectName).toBe("three");
    expect(projectUIStore.entities.size).toBe(3);
    await storeManager.process();

    await storeManager.process(()=>{
        var project1=projectStore.get("1");
        var projectUI1=projectUIStore.get("1");
        if(project1 && projectUI1){
            project1.value.ProjectName="eins";
            expect(project1.isDirty).toBe(false);
            expect(projectUI1.isDirty).toBe(false);
            project1.valueChanged();
            expect(project1.isDirty).toBe(false);
            expect(projectUI1.isDirty).toBe(true);
            expect(projectUI1.value.t).toBe(1);
        }

        //projectStore.get("1")!.value.ProjectName="eins";
    });
});