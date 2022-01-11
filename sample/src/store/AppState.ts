import { DSObjectStore, DSStateValueSelf } from "dependingState";

export class AppState extends DSStateValueSelf<AppState> {
    language: string;

    constructor() {
        super();
        this.language = "en";
    }
}

export class AppStore extends DSObjectStore<AppState, AppState> {
    constructor(storeName: string, value: AppState) {
        super(storeName, value);
    }
}