import { DSObjectStore, DSStateValueSelf } from "dependingState";

export class AppState extends DSStateValueSelf<AppState> {
    language: string;

    constructor() {
        super();
        this.language = "en";
    }
}

export class AppStore extends DSObjectStore<AppState, AppState, "appStore"> {
    constructor(value: AppState) {
        super("appStore", value);
        this.enableEmitDirtyFromValueChanged=true;
    }
}