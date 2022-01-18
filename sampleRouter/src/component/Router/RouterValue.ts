import { DSStateValueSelf } from "dependingState";
import { getRouterValueInitial, HistoryAction, HistoryState, IDSRouterValue, RouterLocation, UpdateMode } from "dependingStateRouter";

export class RouterValue extends DSStateValueSelf<RouterValue> implements IDSRouterValue {
    action: HistoryAction | string;
    location: RouterLocation<HistoryState>;
    updateMode: UpdateMode;

    constructor() {
        super();
        const { action, location, updateMode } = getRouterValueInitial()
        this.action = action;
        this.location = location;
        this.updateMode = updateMode;
    }
}