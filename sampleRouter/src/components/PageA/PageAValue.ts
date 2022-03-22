import { DSStateValue } from "dependingState";

export class PageAValue extends DSStateValue<PageAValue> {
    nbrA: number;
    nbrB: number;
    nbrC: number;
    isLoading: boolean;
    constructor() {
        super(null!);
        this.value = this;
        this.nbrA = 1;
        this.nbrB = 1;
        this.nbrC = 0;
        this.isLoading = true;
    }
}
