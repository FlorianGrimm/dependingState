import type {
    IDSAnyValueStore,
    DSEventHandler,
    DSEventHandlerResult,
    DSUnlisten,
    IDSStoreAction,
    IDSStoreBuilder,
    IDSValueStore,
    DSEvent,
    ThenPromise
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
        if (this.actions.has(key)) {
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
        if (this.storeName !== valueStore.storeName) {
            throw new Error("wrong IDSValueStore");
        }
        this.valueStore = valueStore;
    }

    /**
     * add the callback to the event. if the event is emitted (emitEvent) all callback are invoked.
     * @param msg this message is shown in the console
     * @param callback this function is called
     * @returns a function that removes the event
     * @throws throw an Error if the store-constructor doesn't call theStoresBuilder.bindValueStore(this)
     */
    public listenEvent<
        Event extends DSEvent<Payload, EventType, StoreName>
    >(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], Event['storeName']>): DSUnlisten {
        if (this.valueStore === undefined) {
            throw new Error(`DS DSStoreAction.listenEvent valueStore is not set ${this.storeName} - Did you call theStore's-Builder.bindValueStore(this) in the constructor?`);
        } else {
            if (!msg) {
                msg = `${this.storeName}/${this.event}`;
            }
            return this.valueStore.listenEvent(msg, this.event, callback);
        }
    }

    /**
     * 
     * @param payload 
     */
    emitEvent(
        payload: Payload,
        thenPromise?: ThenPromise | undefined
        ): DSEventHandlerResult {
        if (this.valueStore === undefined) {
            throw new Error(`DS DSStoreAction.emitEvent valueStore is not set ${this.storeName} - Did you call theStore's-Builder.bindValueStore(this) in the constructor?`);
        } else {
            this.valueStore.emitEvent(this.event, payload, thenPromise);
        }
    }
}
