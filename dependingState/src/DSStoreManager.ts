import type {
    IDSStoreManagerInternal,
    IDSStoreManager,
    DSEvent,
    DSEventHandlerResult,
    IDSUIStateValue,
    ValueStoreInternal,
    IDSValueStoreBase,
    IDSAnyValueStore,
    DSManyEventHandlerResult
} from "./types";

import { dsLog } from "./DSLog";
import { catchLog } from "./PromiseHelper";

// type ValueStoreInternal = {
//     mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler }[]>;
//     arrEmitDirtyHandler: { msg: string, handler: DSEmitDirtyHandler<any, any> }[];
//     arrDirtyRelated: { msg: string, valueStore: IDSValueStore<any, any, any, string> }[] | undefined;
//     setEffectiveEvents: Set<string> | undefined;
// } & IDSValueStore<any, any, any, string>;


export class DSStoreManager implements IDSStoreManager, IDSStoreManagerInternal {
    nextStateVersion: number;
    shouldIncrementStateVersion: boolean;
    arrValueStores: IDSAnyValueStore[];
    mapValueStoreInternal: Map<string, ValueStoreInternal>;
    events: DSEvent[];
    storeManagerState: number;
    isProcessing: number;
    arrUIStateValue: IDSUIStateValue[];
    lastPromise: Promise<any | void> | undefined;
    isupdateRegisteredEventsDone: boolean;
    timeInProcess: number;
    enableTiming: boolean;
    isDirty: boolean;

    constructor() {
        this.nextStateVersion = 1;
        this.shouldIncrementStateVersion = false;
        this.arrValueStores = [];
        this.events = [];
        this.isProcessing = 0;
        this.arrUIStateValue = [];
        this.lastPromise = undefined;
        this.isupdateRegisteredEventsDone = false;
        this.mapValueStoreInternal = new Map();
        this.timeInProcess = 0;
        this.storeManagerState = 0;
        this.enableTiming = false;
        this.isDirty=true;
    }

    /**
     * gets the (global) next stateVersion. within procsess() this value will be increased.
     * @param stateVersion 
     */
    public getNextStateVersion(stateVersion: number): number {
        this.shouldIncrementStateVersion = true;
        return this.nextStateVersion;
    }

    /**
     * attach the store to the storeManager. The order of the attachs defines the order of store.processDirty is called.
     * @param valueStore the store to attach
     * @returns this
     */
    public attach(valueStore: IDSValueStoreBase): this {
        if (this.storeManagerState === 0) {
            this.storeManagerState = 1;
        } else if (this.storeManagerState === 1) {
            // OK
        } else {
            throw new Error(`storeManagerState=${this.storeManagerState} has an unexpected value;`);
        }
        const valueStoreInternal = valueStore as ValueStoreInternal;
        this.arrValueStores = this.arrValueStores.concat([valueStoreInternal]);
        this.mapValueStoreInternal.set(valueStoreInternal.storeName, valueStoreInternal);
        valueStore.storeManager = this;
        return this;
    }

    /**
     * get the store by the storename.
     * @param storeName the name of the store
     * @returns the store or undefined if not found.
     */
    public getValueStore(storeName: string): (IDSValueStoreBase | undefined) {
        return this.mapValueStoreInternal.get(storeName);
    }

    /**
     * initialize the storeManager and stores. Call this after you call forall stores storeManager.attach;
     * initialize invoke postAttach in all stores.
     * @returns this
     */
    public initialize(): this {
        if (this.storeManagerState === 1) {
            this.storeManagerState = 2;
        } else if (this.storeManagerState === 0) {
            throw new Error(`storeManagerState=0 has an unexpected value. Did you call all stores.attach?`);
        } else {
            throw new Error(`storeManagerState=${this.storeManagerState} has an unexpected value;`);
        }
        if (dsLog.enabled) {
            dsLog.infoACME("DS", "DSStoreManager", "postAttached", "");
        }
        for (const valueStore of this.arrValueStores) {
            valueStore.postAttached(this);
        }
        if (this.storeManagerState === 2) {
            this.storeManagerState = 3;
        } else {
            throw new Error(`storeManagerState=${this.storeManagerState} has an unexpected value;`);
        }
        this.updateRegisteredEvents();
        this.process();
        return this;
    }

    public resetRegisteredEvents(): void {
        if (this.isupdateRegisteredEventsDone) {
            this.isupdateRegisteredEventsDone = false;
            if (dsLog.enabled) {
                dsLog.infoACME("DS", "DSStoreManager", "resetRegisteredEvents", "");
            }
        }
    }

    public updateRegisteredEvents(): void {
        if (this.storeManagerState === 3) {
            this.storeManagerState = 4;
        } else if (this.storeManagerState === 4) {
            //
        } else if (this.storeManagerState === 0) {
            throw new Error(`storeManagerState=0 has an unexpected value. Did you call all stores.attach?`);
        } else if (this.storeManagerState === 1) {
            throw new Error(`storeManagerState=1 has an unexpected value. Did you call all storeManager.initialize?`);
        } else {
            throw new Error(`storeManagerState=${this.storeManagerState} has an unexpected value;`);
        }
        if (this.isupdateRegisteredEventsDone) {
            return;
        } else {
            if (dsLog.enabled) {
                dsLog.info("DS DSStoreManager updateRegisteredEvents");
            }
            this.isupdateRegisteredEventsDone = true;
            const mapVS = new Map<string, ValueStoreInternal>();
            for (const valueStore of this.arrValueStores) {
                const valueStoreInternal = valueStore as unknown as ValueStoreInternal;
                valueStoreInternal.setEffectiveEvents = new Set();
                mapVS.set(valueStore.storeName, valueStoreInternal);
            }

            this.mapValueStoreInternal = mapVS;

            for (const valueStore of this.arrValueStores) {
                const valueStoreInternal = valueStore as unknown as ValueStoreInternal;
                for (const [storeNameEventType, fn] of valueStoreInternal.mapEventHandlers.entries()) {
                    const pos = storeNameEventType.indexOf("/");
                    const storeName = storeNameEventType.substring(0, pos);
                    const eventType = storeNameEventType.substring(pos + 1);
                    const valueStoreSource = mapVS.get(storeName);
                    if (valueStoreSource) {
                        valueStoreSource.setEffectiveEvents!.add(eventType);
                    }
                }
            }
            if (dsLog.enabled) {
                for (const valueStore of this.arrValueStores) {
                    const valueStoreInternal = valueStore as unknown as ValueStoreInternal;
                    if (valueStoreInternal.setEffectiveEvents!.size === 0) {
                        dsLog.info(`DS DSStoreManager updateRegisteredEvents events ${valueStore.storeName} -> %`);
                    } else {
                        const eventNames = Array.from(valueStoreInternal.setEffectiveEvents!.keys()).sort((a, b) => a.localeCompare(b)).join(", ");
                        dsLog.info(`DS DSStoreManager updateRegisteredEvents events ${valueStore.storeName} -> ${eventNames}`);
                    }
                    {
                        if ((valueStoreInternal.arrEmitDirtyRelated || []).length === 0) {
                            dsLog.info(`DS DSStoreManager updateRegisteredEvents dirtyRelated ${valueStore.storeName} -> %`);
                        } else {
                            const dirtyRelatedNames = (valueStoreInternal.arrEmitDirtyRelated || []).map(r => `${r.msg} @ ${r.valueStore.storeName}`).join(", ");
                            dsLog.info(`DS DSStoreManager updateRegisteredEvents dirtyRelated ${valueStore.storeName} -> ${dirtyRelatedNames}`);
                        }
                    } {
                        if ((valueStoreInternal.arrEmitDirtyHandler || []).length === 0) {
                            dsLog.info(`DS DSStoreManager updateRegisteredEvents dirtyHandlers ${valueStore.storeName} -> %`);
                        } else {
                            const dirtyNames = (valueStoreInternal.arrEmitDirtyHandler || []).map(r => r.msg).join(", ");
                            dsLog.info(`DS DSStoreManager updateRegisteredEvents dirtyHandlers ${valueStore.storeName} -> ${dirtyNames}`);
                        }

                    }
                }
            }
        }
    }

    public emitUIUpdate(uiStateValue: IDSUIStateValue): void {
        if (uiStateValue.triggerScheduled === false) {
            uiStateValue.triggerScheduled = true;
            this.arrUIStateValue.push(uiStateValue);
            if (this.isProcessing === 0) {
                dsLog.warnACME("DS", "DSStoreManager", "emitUIUpdate", "%", "called out of process")
                this.process("emitUIUpdate");
            }
        }
    }

    public emitEvent(event: DSEvent): DSEventHandlerResult {
        if (this.storeManagerState === 2 || this.storeManagerState === 3) {
            this.events.push(event);
        } else {
            if (this.isupdateRegisteredEventsDone) {
                const valueStoreInternal = this.mapValueStoreInternal.get(event.storeName)
                if (valueStoreInternal === undefined) {
                    if (dsLog.enabled) {
                        dsLog.warn(`DS emitEvent no such store ${event.storeName}/${event.event}`)
                    }
                    return;
                }
                const key = `${event.storeName}/${event.event}`;
                const arrEventHandlers = valueStoreInternal.mapEventHandlers.get(key);
                if (arrEventHandlers === undefined || arrEventHandlers.length === 0) {
                    if ((event.event === "attach") || (event.event === "detach") || (event.event === "value")) {
                        // no message
                    } else {
                        debugger;
                        dsLog.warn(`DS emitEvent no eventHandler for event ${event.storeName}/${event.event} defined.`)
                    }
                    return;
                }
            }
            this.events.push(event);
            if (this.isProcessing === 0) {
                if (dsLog.enabled) {
                    dsLog.warnACME("DS", "DSStoreManager", "emitEvent", `${event.storeName}/${event.event}`, "called out of process")
                }
                const p = this.process("immediately from emitEvent");
                if (p && typeof p.then === "function") {
                    return p;
                }
            } else {
                if (dsLog.enabled) {
                    dsLog.infoACME("DS", "DSStoreManager", "emitEvent", `${event.storeName}/${event.event}`, "queued");
                }
            }
        }
    }

    public process(msg?: string, fn?: () => DSEventHandlerResult): DSEventHandlerResult {
        // todo conditional
        let dt: number = 0;
        const enableTiming = this.enableTiming && dsLog.enabled && (this.isProcessing === 0);
        if (enableTiming) {
            // console.time("DS DSStoreManager process");
            dt = (window.performance) ? performance.now() : Date.now();
        }
        let result: DSManyEventHandlerResult = undefined;
        this.updateRegisteredEvents();
        this.isProcessing++;
        if (dsLog.enabled) {
            dsLog.group(`DS processEvent ${(msg || "")} isProcessing:${this.isProcessing}`);
        }
        try {
            if (fn) {
                this.incrementStateVersion();

                const p = fn();
                if (p && typeof p.then === "function") {
                    return p.then((resultValue: any) => {
                        const p2 = this.process();
                        if (p2 && typeof p2.then === "function") {
                            return p2.then(() => resultValue, () => resultValue);
                        }
                        return resultValue;
                    });
                }
            }

            if (this.events.length === 0) {
                this.incrementStateVersion();
                this.processDirty();
                this.processUIUpdates();
            }
            for (let watchdog = 0; (this.events.length > 0) && (watchdog < 100); watchdog++) {
                this.incrementStateVersion();

                /*
                    const events = this.events;
                    this.events = [];

                    for (const event of events) {
                        const p = this.processOneEvent(event);
                        if (p && typeof p.then === "function") {
                            if (result === undefined) { result = []; }
                            result.push(p);
                        }
                    }
                */

                while (this.events.length > 0) {
                    const event = this.events.splice(0, 1)[0];
                    const p = this.processOneEvent(event);
                    if (p && typeof p.then === "function") {
                        if (result === undefined) { result = []; }
                        result.push(p);
                    }
                }

                {
                    this.processDirty();
                    this.processUIUpdates();
                }
            }

        } finally {
            this.isProcessing--;
        }

        if (dsLog.enabled) {
            dsLog.groupEnd();
        }
        if (enableTiming) {
            const time = (window.performance) ? (performance.now() - dt) : (Date.now() - dt);
            // console.timeLog("DS DSStoreManager process");
            this.timeInProcess += time;
            dsLog.infoACME("DS", "DSStoreManager", "process", { current: Math.round(time * 1000) / 10, sum: Math.round(this.timeInProcess * 1000) / 10 }, (window.performance) ? "µs timing" : "ms timing");
        }
        if (result === undefined) {
            return;
        } else {
            return Promise.allSettled(result);
        }
    }

    public processOneEvent(event: DSEvent<any, string, string>): DSEventHandlerResult {
        //if (this.isupdateRegisteredEventsDone) { this.updateRegisteredEvents(); }

        let result: DSManyEventHandlerResult = undefined;

        const valueStoreInternal = this.mapValueStoreInternal.get(event.storeName)
        if (valueStoreInternal === undefined) {
            if (dsLog.logEnabled) {
                dsLog.warn(`DS DSStoreManager processOneEvent no such store ${event.storeName}/${event.event}`)
            }
            return;
        } else {
            const key = `${event.storeName}/${event.event}`;
            const arrEventHandlers = valueStoreInternal.mapEventHandlers.get(key);
            if ((arrEventHandlers !== undefined) && (arrEventHandlers.length > 0)) {

                try {
                    for (const eventHandler of arrEventHandlers) {
                        dsLog.infoACME("DS", "DSStoreManager", "processOneEvent", eventHandler.msg);
                        const p = eventHandler.handler(event);

                        // does the eventHandler return a promise?
                        if (p && typeof p.then === "function") {
                            const cp = catchLog("processOneEvent", p);
                            if (result === undefined) { result = []; }
                            result.push(cp);
                        }
                    }
                } catch (reason) {
                    dsLog.infoACME("DS", "DSStoreManager", "processOneEvent-failed", key, `${reason} ${(reason as Error).stack}`);

                    if (event.thenPromise !== undefined) {
                        event.thenPromise(Promise.reject(reason));
                    }
                    return;
                }

                if (event.thenPromise !== undefined) {
                    let p: DSEventHandlerResult;
                    if ((result === undefined) || (result.length === 0)) {
                        p = event.thenPromise(Promise.resolve(undefined));
                    } else if (result.length === 1) {
                        p = event.thenPromise(result[0]);
                    } else {
                        p = event.thenPromise(Promise.allSettled(result).then((r) => {
                            if (r.length > 0) {
                                const r0 = r[0];
                                if (r0.status == "fulfilled") { return Promise.resolve(r0.value); }
                                if (r0.status == "rejected") { return Promise.reject(r0.reason); }
                            }
                            return undefined;
                        }));
                    }
                    if (p && typeof p.then === "function") {
                        return p;
                    }
                }
            }
        }
    }

    public processDirty(): void {
        if (this.isDirty) {
            this.isDirty = false;
            for (const valueStore of this.arrValueStores) {
                if (valueStore.isDirty) {
                    if (dsLog.enabled) {
                        dsLog.infoACME("DS", "DSStoreManager", "processDirty", valueStore.storeName);
                    }
                    valueStore.isDirty = false;
                    valueStore.processDirty();
                }
            }
        }
    }

    public processUIUpdates(): void {
        if (this.arrUIStateValue.length > 0) {
            if (dsLog.enabled) {
                dsLog.infoACME("DS", "DSStoreManager", "processUIUpdates", `${this.arrUIStateValue.length}`);
            }
            const arrUIStateValue = this.arrUIStateValue;
            this.arrUIStateValue = [];
            for (const uiStateValue of arrUIStateValue) {
                uiStateValue.triggerUIUpdate();
            }
        }
    }

    incrementStateVersion() {
        if (this.shouldIncrementStateVersion) {
            this.shouldIncrementStateVersion = false;
            this.nextStateVersion++;
            if (dsLog.enabled) {
                dsLog.infoACME("DS", "DSStoreManager", "incrementStateVersion", `${this.nextStateVersion}`);
            }
        }
    }

    public setSelfInGlobal() {
        (window as any).appStoreManager = this;
    }
}