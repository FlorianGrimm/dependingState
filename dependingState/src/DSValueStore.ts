import type {
    DSEvent, DSEventHandler, DSEventHandlerResult, DSUnlisten
} from './types'

import type {
    DSStoreManager
} from './DSStoreManager';

import {
    DSStateValue
} from './DSStateValue';
import { DSEventName } from '.';

export class DSValueStore<Value = any>{
    storeName: string;
    entities: DSStateValue<Value>[];
    storeManager: DSStoreManager | undefined;
    mapEventHandlers: Map<string, DSEventHandler[]>;

    constructor(storeName: string) {
        this.entities = [];
        this.storeName = storeName;
        this.storeManager = undefined;
        this.mapEventHandlers = new Map();
    }

    public getNextStateVersion(stateVersion: number): number {
        if (this.storeManager === undefined) {
            return (stateVersion & (Number.MAX_SAFE_INTEGER - 1)) + 1;
        } else {
            return this.storeManager.getNextStateVersion(stateVersion);
        }
    }

    create(value: Value): DSStateValue<Value> {
        const result = new DSStateValue<Value>(value);
        this.attach(result);
        return result;
    }

    attach(stateValue: DSStateValue<Value>): this {
        if (stateValue.store === this){
            return this;
        }
        if (stateValue.store !== undefined){
            throw "already attached";
        }
        stateValue.store = this;
        this.entities.push(stateValue);
        this.emit<DSStateValue<Value>>({ storeName: this.storeName, event: "attach", payload:stateValue});
        return this;
    }

    emit<Payload = any, EventType extends string = string>(event: DSEvent<Payload, EventType>) {
        if (this.storeManager === undefined) {
            this.process(event);
        } else {
            this.storeManager.emit(event);
        }
    }

    listen<Payload = any, EventType extends string = string>(event: DSEventName<EventType>, callback: DSEventHandler<Payload, EventType>): DSUnlisten {
        const key = `${event.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            this.mapEventHandlers.set(key, [callback as DSEventHandler]);
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.concat([callback as DSEventHandler]));
        }
        return this.unlisten.bind(this, { storeName: event.storeName, event: event.event }, callback as DSEventHandler);
    }

    unlisten<Payload = any, EventType extends string = string>(event: DSEventName<EventType>, callback: DSEventHandler<Payload, EventType>): void {
        const key = `${event.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            // should not be
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.filter(cb => cb !== callback));
        }
    }

    process<Payload = any, EventType extends string = string>(event: DSEvent<Payload, EventType>): DSEventHandlerResult {
        const key = `${event.storeName}/${event.event}`;
        let r: DSEventHandlerResult;
        let result: undefined | Promise<any>[];
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            // nobody is listening
        } else {
            for (const callback of arrEventHandlers) {
                if (r === undefined) {
                    r = callback(event);
                } else {
                    r = r.then(() => { return callback(event); });
                }
            }
            // for (const callback of arrEventHandlers) {
            //     const p = callback(event);
            //     if (p && typeof p.then === "function") {
            //         if (result === undefined) {
            //             result = [p];
            //         } else {
            //             result.push(p);
            //         }
            //     }
            // }
        }
        return r;
        // if (result === undefined) {
        //     return;
        // } else {
        //     return Promise.allSettled(result);
        // }
    }
}
