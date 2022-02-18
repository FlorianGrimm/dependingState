import {
    IDSStoreManager,
    DSStoreManager
} from "dependingState";

import type { AppUIStore } from "~/components/AppUI/AppUIStore";
import type { TimerStore } from "~/components/Timer/TimerStore";

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