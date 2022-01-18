import { DSStateValue } from "dependingState";

export class PageBValue extends DSStateValue<PageBValue> {
    nbrA: number;
    nbrB: number;
    nbrC: number;
    constructor() {
        super(null!);
        this.value = this;
        this.nbrA = 1;
        this.nbrB = 1;
        this.nbrC = 0;
    }
}