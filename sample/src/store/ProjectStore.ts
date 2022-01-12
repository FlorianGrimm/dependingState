import { DSEntityStore,DSStateValue } from "dependingState";
import { Project } from "src/types";

function create(project:Project){
    return new DSStateValue(project);
}
function getKey(project:Project){
    return project.ProjectId;
}

export class ProjectStore extends DSEntityStore<string, Project, DSStateValue<Project>, "projectStore">{
    constructor() {
        super("projectStore", {create, getKey});
    }

    hugo(){
        const prj=this.get("1");
        if (prj){
            console.log(prj.value.ProjectName);
        }
    }
}