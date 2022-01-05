import type { DSEvent, DSEventHandlerResult } from "./types";
import { DSValueStore } from "./DSValueStore";
import type { DSUIStateValue } from "./DSUIStateValue";

export class DSStoreManager {
    //stateVersion: number;
    nextStateVersion: number;
    valueStores: DSValueStore[];
    events: DSEvent[];
    isProcessing: number;
    arrUIStateValue: DSUIStateValue[];

    constructor() {
        //this.stateVersion = 0;
        this.nextStateVersion = 1;
        this.valueStores = [];
        this.events = [];
        this.isProcessing = 0;
        this.arrUIStateValue = [];
    }

    public getNextStateVersion(stateVersion: number): number {
        return this.nextStateVersion;
        //return (this.stateVersion & (Number.MAX_SAFE_INTEGER - 1)) + 1;
    }

    public attach(valueStore: DSValueStore): this {
        this.valueStores.push(valueStore);
        valueStore.storeManager = this;
        return this;
    }

    public emitUIUpdate(uiStateValue: DSUIStateValue) {
        if (this.isProcessing === 0) {
            uiStateValue.triggerUIUpdate();
        } else {
            this.arrUIStateValue.push(uiStateValue);
        }
    }

    public emitEvent(event: DSEvent): DSEventHandlerResult {
        this.events.push(event);
        if (this.isProcessing === 0) {
            const p = this.processEvents();
            if (p && typeof p.then === "function") {
                return p;
            }
        }
        return;
    }

    public async processEvents(fn?: () => DSEventHandlerResult) {
        // if (this.isProcessing === 0) {
        //     this.stateVersion = (this.stateVersion & (Number.MAX_SAFE_INTEGER - 1)) + 2;
        //     this.nextStateVersion = this.stateVersion + 1;
        // }
        this.isProcessing++;
        try {
            if (fn) {
                this.nextStateVersion++;
                const p = fn();
                if (p && typeof p.then === "function") {
                    await p;
                }
            }

            for (let watchdog = 0; (this.events.length > 0) && (watchdog < 100); watchdog++) {
                this.nextStateVersion++;
                let result: undefined | Promise<any>[];
                const events = this.events;
                this.events = [];
                for (const event of events) {
                    for (const valueStore of this.valueStores.slice()) {
                        const p = valueStore.processEvent(event);
                        if (p && typeof p.then === "function") {
                            if (result === undefined) {
                                result = [p];
                            } else {
                                result.push(p);
                            }
                        }
                    }
                }
                
                for (const valueStore of this.valueStores.slice()) {
                    valueStore.processDirty();
                }
                
                this.processUIUpdates();
                if (result !== undefined) {
                    await Promise.allSettled(result);
                }                
            }
            
        } finally {
            this.isProcessing--;
        }
    }

    processUIUpdates() {
        if (this.arrUIStateValue.length > 0) {
            const arrUIStateValue = this.arrUIStateValue;
            this.arrUIStateValue = [];
            for (const uiStateValue of arrUIStateValue) {
                uiStateValue.triggerUIUpdate();
            }
        }
    }
}