import { DSStateValueSelf } from "dependingState";

export class PageBValue extends DSStateValueSelf<PageBValue> {
    myPropA: string;
    myPropB: string;
    
    constructor() {
        super();
        this.myPropA = "";
        this.myPropB = "";
    }
}