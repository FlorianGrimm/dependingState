import { DSStateValue } from "dependingState";
import { Project } from "../../types";

export class CompAValue extends DSStateValue<CompAValue> {
    ProjectId: string;
    ProjectName: string;
    Magic: string;
    constructor(project: Project) {
        super(null!);
        this.value = this;
        this.ProjectId = project.ProjectId;
        this.ProjectName = project.ProjectName;
        this.Magic = "";
    }

    public get key(): string {
        return this.ProjectId;
    }
}