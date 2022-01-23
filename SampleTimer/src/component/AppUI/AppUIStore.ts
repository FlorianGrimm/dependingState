import {
    dsLog,
    DSObjectStore,
} from "dependingState";
import { getAppStoreManager } from "~/singletonAppStoreManager";

import type { IAppStoreManager } from "~/store/AppStoreManager";

import { appUIStoreBuilder, timerStopGo } from "./AppUIActions";
import { AppUIValue } from "./AppUIValue";


export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    handleInterval: number | undefined;

    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        appUIStoreBuilder.bindValueStore(this);
        this.handleTick = this.handleTick.bind(this);
    }

    public postAttached(): void {
        super.postAttached();

        timerStopGo.listenEvent("handle", (e) => {
            if (e.payload) {
                if (this.handleInterval === undefined) {
                    if (dsLog.enabled) {
                        dsLog.infoACME("app", "timerStopGo", "toggle", "enable");
                    }
                    this.handleInterval = window.setInterval(this.handleTick, 1000);
                    this.stateValue.value.isRunnging = true;
                    this.stateValue.valueChanged();
                }
            } else {
                if (this.handleInterval !== undefined) {
                    if (dsLog.enabled) {
                        dsLog.infoACME("app", "timerStopGo", "toggle", "disable");
                    }
                    window.clearInterval(this.handleInterval);
                    this.handleInterval = undefined;
                    this.stateValue.value.isRunnging = false;
                    this.stateValue.valueChanged();
                }
            }
        });
    }

    public handleTick() {
        // hint1
        //getAppStoreManager().process("handleTick", ()=>{
            if (dsLog.enabled) {
                dsLog.infoACME("app" ,"AppUIStore", "handleTick", "tick");
            }
            const timerStore = (this.storeManager! as IAppStoreManager).timerStore;
            const timerSV = timerStore.stateValue;
            timerSV.value.counter++;
            timerSV.valueChanged();
        //});
    }
    public processDirty(): void {
        super.processDirty();
    }
}