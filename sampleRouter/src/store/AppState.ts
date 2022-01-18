import { DSObjectStore, DSStateValueSelf } from "dependingState";

export class AppState extends DSStateValueSelf<AppState> {
    startTime: string;
    constructor() {
        super();
        this.startTime = "";
    }
}

export class AppStore extends DSObjectStore<AppState, AppState, "appStore"> {
    constructor(value: AppState) {
        super("appStore", value);
        value.startTime = (new Date()).toISOString();
    }
}