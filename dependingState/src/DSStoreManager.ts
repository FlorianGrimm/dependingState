import type {
    IDSStoreManager,
    IDSValueStore,
    DSEvent,
    DSEventHandlerResult,
    IDSUIStateValue,
    DSEventHandler,
    DSDirtyHandler
} from "./types";

import { dsLog } from "./DSLog";

type ValueStoreInternal = {
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler }[]>;
    arrDirtyHandler: { msg: string, handler: DSDirtyHandler<any> }[];
    arrDirtyRelated: { msg: string, valueStore: IDSValueStore }[] | undefined;
    setEffectiveEvents: Set<string> | undefined;
} & IDSValueStore;

export class DSStoreManager implements IDSStoreManager {
    //stateVersion: number;
    nextStateVersion: number;
    shouldIncrementStateVersion: boolean;
    valueStores: IDSValueStore[];
    events: DSEvent[];
    isProcessing: number;
    arrUIStateValue: IDSUIStateValue[];
    lastPromise: Promise<any | void> | undefined;
    isupdateRegisteredEventsDone: boolean;
    mapValueStoreInternal: Map<string, ValueStoreInternal>;

    constructor() {
        //this.stateVersion = 0;
        this.nextStateVersion = 1;
        this.shouldIncrementStateVersion = false;
        this.valueStores = [];
        this.events = [];
        this.isProcessing = 0;
        this.arrUIStateValue = [];
        this.lastPromise = undefined;
        this.isupdateRegisteredEventsDone = false;
        this.mapValueStoreInternal = new Map();
    }

    public getNextStateVersion(stateVersion: number): number {
        this.shouldIncrementStateVersion = true;
        return this.nextStateVersion;
    }

    public attach(valueStore: IDSValueStore): this {
        this.valueStores = this.valueStores.concat([valueStore]);
        valueStore.storeManager = this;
        return this;
    }

    public postAttached(): this {
        if (dsLog.enabled) {
            dsLog.info("DS postAttached");
        }
        for (const valueStore of this.valueStores) {
            valueStore.postAttached(this);
        }
        this.updateRegisteredEvents();
        return this;
    }

    public resetRegisteredEvents(): void {
        this.isupdateRegisteredEventsDone = false;
    }

    public updateRegisteredEvents(): void {
        if (this.isupdateRegisteredEventsDone) {
            return;
        } else {
            if (dsLog.enabled) {
                dsLog.info("DS updateRegisteredEvents");
            }
            this.isupdateRegisteredEventsDone = true;
            const mapVS = new Map<string, ValueStoreInternal>();
            for (const valueStore of this.valueStores) {
                const valueStoreInternal = valueStore as unknown as ValueStoreInternal;
                valueStoreInternal.setEffectiveEvents = new Set();
                mapVS.set(valueStore.storeName, valueStoreInternal);
            }

            this.mapValueStoreInternal = mapVS;

            for (const valueStore of this.valueStores) {
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
                for (const valueStore of this.valueStores) {
                    const valueStoreInternal = valueStore as unknown as ValueStoreInternal;
                    if (valueStoreInternal.setEffectiveEvents!.size === 0) {
                        dsLog.info(`DS updateRegisteredEvents events ${valueStore.storeName} -> %`);
                    } else {
                        const eventNames = Array.from(valueStoreInternal.setEffectiveEvents!.keys()).sort((a, b) => a.localeCompare(b)).join(", ");
                        dsLog.info(`DS updateRegisteredEvents events ${valueStore.storeName} -> ${eventNames}`);
                    }
                    {
                        if ((valueStoreInternal.arrDirtyRelated || []).length === 0) {
                            dsLog.info(`DS updateRegisteredEvents dirtyRelated ${valueStore.storeName} -> %`);
                        } else {
                            const dirtyRelatedNames = (valueStoreInternal.arrDirtyRelated || []).map(r => `${r.msg} @ ${r.valueStore.storeName}`).join(", ");
                            dsLog.info(`DS updateRegisteredEvents dirtyRelated ${valueStore.storeName} -> ${dirtyRelatedNames}`);
                        }
                    } {
                        if ((valueStoreInternal.arrDirtyHandler || []).length === 0) {
                            dsLog.info(`DS updateRegisteredEvents dirtyHandlers ${valueStore.storeName} -> %`);
                        } else {
                            const dirtyNames = (valueStoreInternal.arrDirtyHandler || []).map(r => r.msg).join(", ");
                            dsLog.info(`DS updateRegisteredEvents dirtyHandlers ${valueStore.storeName} -> ${dirtyNames}`);
                        }

                    }
                }
            }
        }
    }

    public emitUIUpdate(uiStateValue: IDSUIStateValue): void {
        if (this.isProcessing === 0) {
            uiStateValue.triggerUIUpdate();
        } else {
            if (uiStateValue.triggerScheduled === false) {
                uiStateValue.triggerScheduled = true;
                this.arrUIStateValue.push(uiStateValue);
            }
        }
    }

    public emitEvent(event: DSEvent): DSEventHandlerResult {
        if (this.isupdateRegisteredEventsDone) {
            const valueStoreInternal = this.mapValueStoreInternal.get(event.storeName)
            if (valueStoreInternal === undefined) {
                if(dsLog.enabled){
                    dsLog.warn(`DS emitEvent no such store ${event.storeName}/${event.event}`)
                }
                return;
            }
            const key = `${event.storeName}/${event.event}`;
            const arrEventHandlers = valueStoreInternal.mapEventHandlers.get(key);
            if (arrEventHandlers === undefined || arrEventHandlers.length === 0) {
                if ((event.event === "attach") || (event.event === "detach") || (event.event === "value")){
                    // no message
                } else {
                    dsLog.warn(`DS emitEvent no such event ${event.storeName}/${event.event}`)
                }
                return;
            }
        }
        this.events.push(event);
        if (this.isProcessing === 0) {
            if (dsLog.enabled) {
                dsLog.info(`DS emitEvent ${event.storeName}/${event.event}  immediately`);
            }
            const p = this.process("immediately from emitEvent");
            if (p && typeof p.then === "function") {
                return p;
            }
        } else {
            if (dsLog.enabled) {
                dsLog.info(`DS emitEvent ${event.storeName}/${event.event}  queued`);
            }
        }
        return;
    }

    public async process(msg?: string, fn?: () => DSEventHandlerResult) {
        // if (this.isProcessing === 0) {
        //     this.stateVersion = (this.stateVersion & (Number.MAX_SAFE_INTEGER - 1)) + 2;
        //     this.nextStateVersion = this.stateVersion + 1;
        // }
        let result: any | undefined = undefined;
        this.isProcessing++;
        if (dsLog.enabled) {
            console.group(`DS processEvent ${(msg || "")} isProcessing:${this.isProcessing}`);
            //dsLog.info(`DS processEvent ${(msg || "")} isProcessing:${this.isProcessing}`);
        }
        this.updateRegisteredEvents();
        try {
            if (this.lastPromise) {
                await this.lastPromise;
                this.lastPromise = undefined;
            }
            if (fn) {
                this.incrementStateVersion();

                const p = fn();
                if (p && typeof p.then === "function") {
                    // result = await catchLog(`process fn:${fn.name}`, p);
                    result = await p;
                }
            }

            for (let watchdog = 0; (this.events.length > 0) && (watchdog < 100); watchdog++) {
                this.incrementStateVersion();

                const events = this.events;
                this.events = [];

                for (const event of events) {
                    for (const valueStore of this.valueStores) {
                        let runProcessEventQ: boolean;
                        if (valueStore.listenToAnyStore) {
                            if (dsLog.enabled) {
                                dsLog.info(`DS processEvent ${event.storeName}/${event.event} @ store: ${valueStore.storeName}/listenToAnyStore`);
                            }
                            runProcessEventQ = true;
                        } else if (event.storeName === valueStore.storeName) {
                            if (dsLog.enabled) {
                                dsLog.info(`DS processEvent ${event.storeName}/${event.event} @ store: ${valueStore.storeName}/same storeName`);
                            }
                            runProcessEventQ = true;
                        } else {
                            if (dsLog.enabled) {
                                dsLog.debug(`DS processEvent ${event.storeName}/${event.event} @ store: ${valueStore.storeName}/skip`);
                            }
                            runProcessEventQ = false;
                        }

                        if (runProcessEventQ) {
                            const p = valueStore.processEvent(event);
                            if (p && typeof p.then === "function") {
                                // await catchLog(`process valueStore:${valueStore.storeName}`, p);
                                await p;
                            }
                        }
                    }
                }
                {
                    for (const valueStore of this.valueStores) {
                        if (valueStore.isDirty) {
                            if (dsLog.enabled) {
                                dsLog.info(`DS processDirty store: ${valueStore.storeName}`);
                            }
                            valueStore.isDirty = false;
                            valueStore.processDirty();
                        }
                    }
                    this.processUIUpdates();
                }
            }

        } finally {
            this.isProcessing--;
        }
        if (dsLog.enabled){
            console.groupEnd();
        }
        return result;
    }

    public processUIUpdates(): void {
        if (this.arrUIStateValue.length > 0) {
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
                dsLog.info(`DS StateVersion: ${this.nextStateVersion}`);
            }
        }
    }
}