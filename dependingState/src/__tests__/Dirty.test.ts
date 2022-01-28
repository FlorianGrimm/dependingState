import { DSStateValueSelf } from "../DSStateValueSelf";
import {
    DSMapStore,
    DSStoreManager,
    DSStateValue,
    DSEntityStore,
    dsLog
} from "../index";

class Project {
    constructor(
        public ProjectId: string = "",
        public ProjectName: string = ""
    ) {
    }
}

class ProjectStore extends DSEntityStore<string, Project>{
    processDirtyCount:number
    constructor(storeName: string) {
        super(storeName, { create: ProjectStore.create, getKey: ProjectStore.getKey });
        this.processDirtyCount=0;
    }

    public static create(project: Project): DSStateValue<Project> {
        return new DSStateValue<Project>(project);
    }
    public static getKey(project: Project): string {
        return project.ProjectId;
    }

    public processDirty(): boolean {
        super.processDirty();
        this.processDirtyCount++;
        return true;
    }
}


class ProjectStoreNoProcessDirty extends DSEntityStore<string, Project>{
    processDirtyCount:number
    constructor(storeName: string) {
        super(storeName, { create: ProjectStore.create, getKey: ProjectStore.getKey });
        this.processDirtyCount=0;
    }

    public static create(project: Project): DSStateValue<Project> {
        return new DSStateValue<Project>(project);
    }
    public static getKey(project: Project): string {
        return project.ProjectId;
    }
}

class ProjectUI extends DSStateValueSelf<ProjectUI>{
    t: number;
    constructor(
        public projectValue: Project
    ) {
        super();
        this.t = 0;
    }

    public get key(): string {
        return this.projectValue.ProjectId;
    }
}

class DSStoreManagerDirty extends DSStoreManager {
    constructor(
        public project: ProjectStore,
        public projectUIStore: DSMapStore<string, ProjectUI>
    ) {
        super();
        this.attach(project);
        this.attach(projectUIStore);
    }
}

test('processDirty is overwriten', ()=>{
    dsLog.initialize("disabled");
    const projectStore = new ProjectStore("project");
    const projectStoreNoProcessDirty = new ProjectStoreNoProcessDirty("ProjectStoreNoProcessDirty")
    expect(projectStore.processDirty === ProjectStore.prototype.processDirty).toBe(true);
    expect(projectStore.processDirty !== DSEntityStore.prototype.processDirty).toBe(true);
    expect(projectStoreNoProcessDirty.processDirty === DSEntityStore.prototype.processDirty).toBe(true);
});

test('Dirty', async () => {
    dsLog.initialize("disabled");
    const projectStore = new ProjectStore("project");
    const projectUIStore = new DSMapStore<string, ProjectUI>("projectUI");
    const storeManager = new DSStoreManagerDirty(projectStore, projectUIStore);
    storeManager.initialize(()=>{
        projectStore.listenEventAttach("test", (projectValue) => {
            const project = projectValue.payload.entity.value;
            projectUIStore.attach(project.ProjectId, new ProjectUI(project))
        });
        projectStore.listenValueChanged("test", (project) => {
            const projectUI = projectUIStore.get(project!.value.ProjectId);
            if (projectUI) {
                projectUIStore.setDirty("test");
                projectUI.value.t = projectUI.value.t + 1;
            }
        });
    });
    
    // init
    projectStore.set(new Project("1", "one"));
    expect(projectStore.get("1")!.value.ProjectName).toBe("one");
    projectStore.setMany([new Project("2", "two"), new Project("3", "three")]);
    expect(projectStore.get("2")!.value.ProjectName).toBe("two");
    expect(projectStore.get("3")!.value.ProjectName).toBe("three");
    expect(projectUIStore.entities.size).toBe(3);
    await storeManager.process("init");

    await storeManager.process("Dirty", () => {
        var project1 = projectStore.get("1");
        var projectUI1 = projectUIStore.get("1");
        expect(project1 && projectUI1 && (project1.value === projectUI1.value.projectValue)).toBe(true);
        if (project1 && projectUI1) {
            project1.value.ProjectName = "eins";
            project1.valueChanged("eins");
            expect(projectUI1.value.t).toBe(1);
        }
    });
});