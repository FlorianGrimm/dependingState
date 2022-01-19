import { DSStateValueSelf, IDSStateValue } from "dependingState";
import { CompAValue } from "../CompA/CompAValue";

export class AppViewProjectsUIStateValue extends DSStateValueSelf<AppViewProjectsUIStateValue>{
    compAVSs: IDSStateValue<CompAValue>[];

    constructor() {
        super();
        this.compAVSs = [];
    }
}