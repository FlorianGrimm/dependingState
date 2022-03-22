import { DSStateValue } from "dependingState";
import { Project } from "../../types";

export class CompAValue extends DSStateValue<CompAValue> {
    ProjectId: string;
    ProjectName: string;
    Magic: string;
    nbrA: number;
    nbrB: number;
    nbrC: number;
    constructor(project: Project) {
        super(null!);
        this.value = this;
        this.ProjectId = project.ProjectId;
        this.ProjectName = project.ProjectName;
        this.Magic = "";
        this.nbrA = 1;
        this.nbrB = 2;
        this.nbrC = 0;
    }

    public get key(): string {
        return this.ProjectId;
    }
}
