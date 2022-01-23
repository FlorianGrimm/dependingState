import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppUIStore } from "~/component/AppUI/AppUIStore";
import type { TimerStore } from "~/component/Timer/TimerStore";

export interface IAppStoreManager extends IDSStoreManager {
    appUIStore: AppUIStore;
    timerStore: TimerStore;
}

export class AppStoreManager extends DSStoreManager implements IAppStoreManager {
    constructor(
        public appUIStore: AppUIStore,
        public timerStore: TimerStore,
    ) {
        super();
        this.attach(appUIStore);
        this.attach(timerStore);
    }
}