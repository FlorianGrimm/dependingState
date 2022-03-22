import {
    dsLog,
    DSObjectStore,
    getPropertiesChanged
} from "dependingState";
import { appUIStoreBuilder } from "./AppUIActions";
import { AppUIValue } from "./AppUIValue";

export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        value.startTime = (new Date()).toISOString();
        this.setStoreBuilder(appUIStoreBuilder);
    }
}
