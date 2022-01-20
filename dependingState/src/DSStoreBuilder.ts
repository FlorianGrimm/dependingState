import type { 
    IDSAnyValueStore,
    DSEventHandler,
    DSEventHandlerResult,
    DSUnlisten,
    IDSStoreAction,
    IDSStoreBuilder,
    IDSValueStore,
    DSEvent
} from "./types";

import {
     dsLog, 
} from "./DSLog";

export function storeBuilder<
    StoreName extends string = string
>(storeName: StoreName): DSStoreBuilder<StoreName> {
    return new DSStoreBuilder<StoreName>(storeName);
}

export class DSStoreBuilder<
    StoreName extends string = string
    > implements IDSStoreBuilder<StoreName> {
    actions: Map<string, DSStoreAction<any, string, StoreName>>;
    valueStore: IDSAnyValueStore | undefined;

    constructor(
        public storeName: StoreName
    ) {
        this.actions = new Map();
        this.valueStore = undefined;
    }

    public createAction<
        Payload,
        EventType extends string = string
    >(
        event: EventType
    ): DSStoreAction<Payload, EventType, StoreName> {
        const result = new DSStoreAction<Payload, EventType, StoreName>(
            event,
            this.storeName
        );
        const key = `${this.storeName}/${event}`;
        if (this.actions.has(key)){
            throw new Error(`DS createAction event with that name already created. ${key}.`);
        }
        this.actions.set(key, result);
        if (this.valueStore !== undefined) {
            result.bindValueStore(this.valueStore);
        }
        return result;
    }

    public bindValueStore(valueStore: IDSAnyValueStore): void {
        this.valueStore = valueStore;
        for (const action of this.actions.values()) {
            dsLog.debugACME("DS", "DSStoreBuilder", "bindValueStore", `${action.storeName}/${action.event}`);
            action.bindValueStore(valueStore);
        }
    }
}
export class DSStoreAction<
    Payload,
    EventType extends string,
    StoreName extends string
    > implements IDSStoreAction<Payload, EventType, StoreName> {

    valueStore: IDSAnyValueStore | undefined;

    constructor(
        public event: EventType,
        public storeName: StoreName
    ) {
    }

    // TODO would it be better to create a DSBoundStoreAction
    bindValueStore(valueStore: IDSAnyValueStore): void {
        if (this.storeName !== valueStore.storeName){ 
            throw new Error("wrong IDSValueStore");
        }
        this.valueStore = valueStore;
    }

    public listenEvent<
        Event extends DSEvent<Payload, EventType, StoreName>
    >(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], Event['storeName']>): DSUnlisten {
        if (this.valueStore === undefined){
            throw new Error(`DS DSStoreAction.listenEvent valueStore is not set ${this.storeName} - Did you call builder.bindValueStore(this) in the constructor?`);
        } else {
            if (!msg){
                msg=`${this.storeName}/${this.event}`;
            }
            return this.valueStore.listenEvent(msg, this.event, callback);
        }
    }

    /*
    public listenEventAnyStore<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(msg: string, event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten {
    }
    */

    emitEvent(payload: Payload): DSEventHandlerResult {
        if (this.valueStore===undefined){
            throw new Error(`DS DSStoreAction.emitEvent valueStore is not set ${this.storeName}.`);
        } else {
            this.valueStore.emitEvent(this.event, payload);
        }
    }
}
