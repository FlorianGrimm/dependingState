import { DSStateValue } from "dependingState";

export class PageBValue extends DSStateValue<PageBValue> {
    nbrA: number;
    nbrB: number;
    nbrC: number;
    constructor() {
        super(null!);
        this.value = this;
        this.nbrA = 2;
        this.nbrB = 2;
        this.nbrC = 0;
    }
}