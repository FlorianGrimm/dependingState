import { DSObjectStore, DSStateValueSelf } from "dependingState";

export class AppState extends DSStateValueSelf<AppState> {
    constructor() {
        super();
    }
}

export class AppStore extends DSObjectStore<AppState, "appStore"> {
    constructor(value: AppState) {
        super("appStore", value);
    }

    public postAttached(): void {
        super.postAttached();
    }
}