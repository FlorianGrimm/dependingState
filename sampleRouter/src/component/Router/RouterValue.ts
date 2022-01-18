import { DSStateValueSelf } from "dependingState";
import { IDSRouterValue, To } from "dependingStateRouter";

export class RouterValue extends DSStateValueSelf<RouterValue> implements IDSRouterValue {
    to: To;
    page : string;

    constructor() {
        super();
        this.to="";
        this.page="";
    }
}