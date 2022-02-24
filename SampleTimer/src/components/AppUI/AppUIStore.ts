import {
    dsLog,
    DSObjectStore,
    getPropertiesChanged,
    getPropertiesSet,
} from "dependingState";

//import { getAppStoreManager } from "~/singletonAppStoreManager";

import type { IAppStoreManager } from "~/services/AppStoreManager";
import { TimerValue } from "~/components/Timer/TimerValue";

import { appUIStoreBuilder, timerStopGo } from "./AppUIActions";
import { AppUIValue } from "./AppUIValue";

const propertysetIsRunning = getPropertiesSet<AppUIValue>(['isRunnging']);
const propertysetCounter = getPropertiesSet<TimerValue>(['counter']);

export class AppUIStore extends DSObjectStore<AppUIValue, "AppUIStore"> {
    handleInterval: number | undefined;
    timeInterval: number;

    constructor(value: AppUIValue) {
        super("AppUIStore", value);
        appUIStoreBuilder.bindValueStore(this);
        this.handleTick = this.handleTick.bind(this);
        this.timeInterval = 1000;
    }

    public initializeStore(): void {
        super.initializeStore();


        timerStopGo.listenEvent("handle", (e) => {
            if (e.payload) {
                if (this.handleInterval === undefined) {
                    if (dsLog.enabled) {
                        dsLog.infoACME("app", "timerStopGo", "toggle", "enable");
                    }
                    this.handleInterval = window.setInterval(this.handleTick, this.timeInterval);
                    this.stateValue.value.isRunnging = true;
                    getPropertiesChanged
                    this.stateValue.valueChanged("running", propertysetIsRunning);
                }
            } else {
                if (this.handleInterval !== undefined) {
                    if (dsLog.enabled) {
                        dsLog.infoACME("app", "timerStopGo", "toggle", "disable");
                    }
                    window.clearInterval(this.handleInterval);
                    this.handleInterval = undefined;
                    this.stateValue.value.isRunnging = false;
                    this.stateValue.valueChanged("stopping", propertysetIsRunning);
                }
            }
        });
    }

    public handleTick() {
        // hint1
        //getAppStoreManager().process("handleTick", ()=>{
        if (dsLog.enabled) {
            dsLog.infoACME("app", "AppUIStore", "handleTick", "tick");
        }
        const timerStore = (this.storeManager! as IAppStoreManager).timerStore;
        const timerSV = timerStore.stateValue;
        timerSV.value.counter++;
        timerSV.valueChanged("handleTick", propertysetCounter);
        //});
    }
}