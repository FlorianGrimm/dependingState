import type { DSEvent, DSEventHandlerResult } from "./types";
import { DSValueStore } from "./DSValueStore";

export class DSStoreManager {
    stateVersion: number;
    nextStateVersion: number;
    valueStores: DSValueStore[];
    events: DSEvent[];
    isProcessing: number;

    constructor() {
        this.stateVersion = 0;
        this.nextStateVersion = 1;
        this.valueStores = [];
        this.events = [];
        this.isProcessing = 0;
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

    public emit(event: DSEvent) {
        this.events.push(event);
        if (this.isProcessing === 0) {
            this.process();
        }
    }

    public async process(fn?: () => DSEventHandlerResult) {
        if (this.isProcessing === 0) {
            this.stateVersion = (this.stateVersion & (Number.MAX_SAFE_INTEGER - 1)) + 2;
            this.nextStateVersion = this.stateVersion + 1;
        }
        this.isProcessing++;
        try {
            if (fn) { 
                const p = fn(); 
                if (p && typeof p.then === "function") {
                    await p;
                }
            }

            for (let watchdog = 0; (this.events.length > 0) && (watchdog < 100); watchdog++) {
                let result: undefined | Promise<any>[];
                const events = this.events;
                this.events = [];
                for (const event of events) {
                    for (const valueStore of this.valueStores.slice()) {
                        const p = valueStore.process(event);
                        if (p && typeof p.then === "function") {
                            if (result === undefined) {
                                result = [p];
                            } else {
                                result.push(p);
                            }
                        }
                    }
                }
                if (result !== undefined) {
                    await Promise.all(result);
                }
            }
        } finally {
            this.isProcessing--;
        }
    }
}