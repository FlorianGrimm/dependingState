import { DSStateValueSelf } from "dependingState";

export class PageAValue extends DSStateValueSelf<PageAValue> {
    myPropA: string;
    myPropB: string;
    
    constructor() {
        super();
        this.myPropA = "";
        this.myPropB = "";
    }
}