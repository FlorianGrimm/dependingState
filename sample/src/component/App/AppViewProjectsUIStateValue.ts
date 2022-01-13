import { DSStateValueSelf } from "dependingState";
import { CompAValue } from "../CompA/CompAValue";

export class AppViewProjectsUIStateValue extends DSStateValueSelf<AppViewProjectsUIStateValue>{
    compAUIStates: CompAValue[];

    constructor() {
        super();
        this.compAUIStates = [];
    }
}