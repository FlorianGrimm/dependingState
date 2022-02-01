// import type {
//     IDSAnyValueStore,
//     DSEventHandler,
//     DSEventHandlerResult,
//     DSUnlisten,
//     IDSStoreAction,
//     IDSStoreBuilder,
//     DSEvent,
//     IDSStoreManagerInternal,
//     IDSValueStoreBase,
//     IDSAnyValueStoreInternal
// } from "./types";

// import {
//     dsLog,
// } from "./DSLog";

// export type StoreBuilder<
//     StoreName extends string,
//     Actions
//     > = {
//         action<
//             Payload,
//             EventType extends string = string
//         >(
//             event: EventType
//         ): StoreBuilder<
//             StoreName,
//             (Actions & {
//                 [Event in EventType]: DSStoreAction<Payload, EventType, StoreName>
//             })>;

//         createAction<
//             Payload,
//             EventType extends string = string
//         >(
//             event: EventType
//         ): IDSStoreAction<Payload, EventType, StoreName>;

//         getActions(): Actions;
//         bindValueStore(valueStore: IDSValueStoreBase): void;
//     }

// export function storeBuilder<
//     StoreName extends string
// >(storeName: StoreName): StoreBuilder<StoreName, {}> {
//     return new DSStoreBuilder<StoreName>(storeName);
// }

// export class DSStoreBuilder<
//     StoreName extends string = string
//     > implements IDSStoreBuilder<StoreName> {
//     actions: Map<string, DSStoreAction<any, string, StoreName>>;
//     objActions: {
//         [Key: string]: any
//     };
//     valueStore: IDSAnyValueStore | undefined;

//     constructor(
//         public storeName: StoreName
//     ) {
//         this.actions = new Map();
//         this.valueStore = undefined;
//         this.objActions = {};
//     }

//     public createAction<
//         Payload,
//         EventType extends string
//     >(
//         event: EventType
//     ): IDSStoreAction<Payload, EventType, StoreName> {
//         const storeAction = new DSStoreAction<Payload, EventType, StoreName>(
//             event,
//             this.storeName
//         );
//         const key = `${this.storeName}/${event}`;
//         if (this.actions.has(key)) {
//             throw new Error(`DS createAction event with that name already created. ${key}.`);
//         }
//         this.actions.set(key, storeAction);
//         if (this.valueStore !== undefined) {
//             storeAction.bindValueStore(this.valueStore);
//         }
//         this.objActions[event] = storeAction;
//         return storeAction;
//     }

//     public action<
//         Payload,
//         EventType extends string
//     >(
//         event: EventType
//     ): this {
//         const storeAction = new DSStoreAction<Payload, EventType, StoreName>(
//             event,
//             this.storeName
//         );
//         const key = `${this.storeName}/${event}`;
//         if (this.actions.has(key)) {
//             throw new Error(`DS createAction event with that name already created. ${key}.`);
//         }
//         this.actions.set(key, storeAction);
//         if (this.valueStore !== undefined) {
//             storeAction.bindValueStore(this.valueStore);
//         }
//         this.objActions[event] = storeAction;
//         return this;
//     }

//     getActions(): any {
//         return this.objActions;
//     }

//     public bindValueStore(valueStore: IDSValueStoreBase): void {
//         this.valueStore = valueStore as IDSAnyValueStore;
//         for (const action of this.actions.values()) {
//             dsLog.debugACME("DS", "DSStoreBuilder", "bindValueStore", `${action.storeName}/${action.event}`);
//             action.bindValueStore(valueStore);
//         }
//     }
// }
// export class DSStoreAction<
//     Payload,
//     EventType extends string,
//     StoreName extends string
//     > implements IDSStoreAction<Payload, EventType, StoreName> {

//     valueStore: IDSAnyValueStoreInternal | undefined;

//     constructor(
//         public event: EventType,
//         public storeName: StoreName
//     ) {
//     }

//     // TODO would it be better to create a DSBoundStoreAction?

//     bindValueStore(valueStore: IDSValueStoreBase): void {
//         if (this.storeName !== (valueStore as IDSAnyValueStoreInternal).storeName) {
//             throw new Error("wrong IDSValueStore");
//         }
//         this.valueStore = (valueStore as IDSAnyValueStoreInternal);
//     }

//     /**
//      * add the callback to the event. if the event is emitted (emitEvent) all callback are invoked.
//      * @param msg this message is shown in the console
//      * @param callback this function is called
//      * @returns a function that removes the event
//      * @throws throw an Error if the store-constructor doesn't call theStoresBuilder.bindValueStore(this)
//      */
//     public listenEvent<
//     Event extends DSEvent<Payload, EventType, StoreName>
//     >(msg: string, callback: DSEventHandler<Event['payload'], Event['event'], Event['storeName']>): DSUnlisten {
//         if(this.valueStore === undefined) {
//     throw new Error(`DS DSStoreAction.listenEvent valueStore is not set ${this.storeName} - Did you call theStore's-Builder.bindValueStore(this) in the constructor?`);
// } else {
//     if (!msg) {
//         msg = `${this.storeName}/${this.event}`;
//     }
//     return this.valueStore.listenEvent(msg, this.event, callback);
// }
//     }

// /**
//  * emit the event
//  * @param payload the payload
//  */
// emitEvent(
//     payload: Payload
// ): DSEventHandlerResult {
//     if (this.valueStore === undefined) {
//         throw new Error(`DS DSStoreAction.emitEvent valueStore is not set ${this.storeName} - Did you call theStore's-Builder.bindValueStore(this) in the constructor?`);
//     } else {
//         this.valueStore.emitEvent(this.event, payload);
//     }
// }

// /**
// * emit the event - if needed process will be called
// * @param msg 
// * @param payload the payload
// */
// emitEventAndProcess(
//     msg: string,
//     payload: Payload
// ): DSEventHandlerResult {
//     const valueStore = this.valueStore;
//     const storeManager = this.valueStore?.storeManager;
//     if ((valueStore === undefined) || (storeManager === undefined)) {
//         throw new Error(`DS DSStoreAction.emitEvent valueStore is not set ${this.storeName} - Did you call theStore's-Builder.bindValueStore(this) in the constructor?`);
//     } else {
//         if ((storeManager as IDSStoreManagerInternal).isProcessing === 0) {
//             if ((this.valueStore as IDSAnyValueStoreInternal).hasEventHandlersFor(this.event)) {
//                 storeManager.process(msg, () => {
//                     valueStore.emitEvent(this.event, payload);
//                 });
//             }
//         } else {
//             valueStore.emitEvent(this.event, payload);
//         }
//     }
// }
// }
