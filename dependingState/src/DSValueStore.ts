import type {
    DSEmitDirtyHandler,
    DSEmitDirtyValueHandler,
    DSEvent,
    DSEventHandler,
    DSEventHandlerResult,
    DSUnlisten,
    DSEventName,
    IDSValueStore,
    IDSStateValue,
    IDSStoreManager,
    IDSUIStateValue,
    ConfigurationDSValueStore,
    IDSStoreBuilder,
    IDSAnyValueStore,
    IDSValueStoreBase,
    ThenPromise
} from './types'

import {
    dsLog
} from './DSLog';
import { IDSStoreManagerInternal } from '.';

// State Value extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),

export class DSValueStore<
    Key,
    Value,
    StoreName extends string
    > implements IDSValueStore<Key, Value, StoreName>{
    private _isDirty: boolean;
    storeName: StoreName;
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    listenToAnyStore: boolean;
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler<any, string, string> }[]>;
    arrEmitDirtyHandler: { msg: string, handler: DSEmitDirtyHandler<any> }[];
    arrEmitDirtyValueHandler: { msg: string, handler: DSEmitDirtyValueHandler<Value> }[];
    arrEmitDirtyRelated: { msg: string, valueStore: IDSAnyValueStore }[] | undefined;
    setEffectiveEvents: Set<string> | undefined;
    enableEmitDirtyFromValueChanged: boolean;
    configuration: ConfigurationDSValueStore<Value>;
    storeBuilder: IDSStoreBuilder<StoreName> | undefined;

    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSValueStore<Value>
    ) {
        this.storeName = storeName;
        this.storeManager = undefined;
        this.listenToAnyStore = false;
        this.mapEventHandlers = new Map();
        this.arrEmitDirtyHandler = [];
        this.arrEmitDirtyValueHandler = [];
        this._isDirty = false;
        this.stateVersion = 1;
        this.enableEmitDirtyFromValueChanged = false;

        if (configuration === undefined) {
            this.configuration = {};
        } else {
            this.configuration = { ...configuration };
        }
    }

    public get isDirty(): boolean {
        return this._isDirty;
    }

    public set isDirty(value: boolean) {
        if (this._isDirty == value) {
            //
        } else {
            this._isDirty = value;
            if (this.storeManager !== undefined) {
                this.storeManager.isDirty = true;
            }
            if (value) {
                dsLog.infoACME("DS", "DSValueStore", "isDirty", this.storeName, "true");
            } else {
                //dsLog.infoACME("DS", "DSValueStore", "isDirty", this.storeName, "false");
            }
        }
    }

    public setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void {
        if (this.storeBuilder !== undefined) {
            throw new Error(`DS storeBuilder is already set ${this.storeName}`);
        }
        this.storeBuilder = storeBuilder;
        storeBuilder.bindValueStore(this);
    }

    public initializeStore(): void {
        this.stateVersion = this.storeManager!.getNextStateVersion(0);
        if (this.configuration.initializeStore !== undefined) {
            this.configuration.initializeStore();
        }
    }

    public initializeBoot(): void {

    }

    public getNextStateVersion(stateVersion: number): number {
        if (this.storeManager === undefined) {
            return (this.stateVersion = (Math.max(this.stateVersion, stateVersion) + 1));
        } else {
            return (this.stateVersion = this.storeManager.getNextStateVersion(stateVersion));
        }
    }

    public getEntities(): { key: Key, stateValue: IDSStateValue<Value> }[] {
        return [];
    }

    public listenDirtyRelated(msg: string, relatedValueStore: IDSValueStoreBase): DSUnlisten {
        if (this.arrEmitDirtyRelated === undefined) {
            this.arrEmitDirtyRelated = [];
        }
        const index = this.arrEmitDirtyRelated.findIndex((item) => (item.valueStore === relatedValueStore));
        if (index < 0) {
            this.enableEmitDirtyFromValueChanged = true;
            this.arrEmitDirtyRelated = (this.arrEmitDirtyRelated || []).concat([{ msg: msg, valueStore: relatedValueStore as IDSAnyValueStore }]);
            return (() => { this.unlistenDirtyRelated(relatedValueStore); });
        } else {
            return (() => { });
        }
    }

    public unlistenDirtyRelated(relatedValueStore: IDSValueStoreBase): void {
        if (this.arrEmitDirtyRelated !== undefined) {
            this.arrEmitDirtyRelated = this.arrEmitDirtyRelated.filter((item) => (item.valueStore !== relatedValueStore));
            if (this.arrEmitDirtyRelated.length === 0) {
                this.arrEmitDirtyRelated = undefined;
            }
        }
    }

    public emitDirtyFromValueChanged(stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void {
        if (this.enableEmitDirtyFromValueChanged) {
            this.emitDirtyValue(stateValue, properties);
        }
    }

    public emitDirtyValue(stateValue?: IDSStateValue<Value>, properties?: Set<keyof Value>): void {
        if (dsLog.enabled) {
            dsLog.infoACME("DS", "DSValueStore", "emitDirty", this.storeName);
        }
        if (this.arrEmitDirtyRelated !== undefined) {
            if (dsLog.enabled) {
                const msgDirtyRelated = this.arrEmitDirtyRelated.map(dr => dr.msg).join(", ");
                dsLog.infoACME("DS", "DSValueStore", "emitDirty", msgDirtyRelated, "/DirtyRelated");
            }
            for (const dirtyRelated of this.arrEmitDirtyRelated) {
                dirtyRelated.valueStore.isDirty = true;
            }
        }
        for (const dirtyHandler of this.arrEmitDirtyValueHandler) {
            if (dsLog.enabled) {
                dsLog.infoACME("DS", "DSValueStore", "emitDirty", dirtyHandler.msg, "/dirtyHandler");
            }
            dirtyHandler.handler(stateValue, properties);
        }
        this.isDirty = true;
    }

    public listenemitDirtyValue(msg: string, callback: DSEmitDirtyValueHandler<Value>): DSUnlisten {
        // think about
        this.enableEmitDirtyFromValueChanged = true;

        this.arrEmitDirtyValueHandler.push({ msg: msg, handler: callback });
        return this.unlistenemitDirtyValue.bind(this, callback);
    }

    public unlistenemitDirtyValue(callback: DSEmitDirtyValueHandler<Value>): void {
        this.arrEmitDirtyValueHandler = this.arrEmitDirtyValueHandler.filter((cb) => cb.handler !== callback);
    }

    public emitDirty(selfDirty:boolean): void{
        if (selfDirty){

        }
    }

    public listenDirty(msg: string, callback: DSEmitDirtyHandler<Value>): DSUnlisten{
        return this.unlistenDirty.bind(this, callback);
    }

    public unlistenDirty(callback: DSEmitDirtyHandler<Value>): void{

    }


    public processDirty(): void {
        this.isDirty = false;
    }

    public emitUIUpdate(uiStateValue: IDSUIStateValue<Value>) {
        if (this.storeManager === undefined) {
            uiStateValue.triggerUIUpdate();
        } else {
            this.storeManager.emitUIUpdate(uiStateValue);
        }
    }

    public emitEvent<
        Event extends DSEvent<any, string, StoreName>
    >(
        eventType: Event['event'],
        payload: Event['payload'],
        thenPromise?: ThenPromise | undefined
    ): DSEventHandlerResult {
        const event: DSEvent<Event['payload'], Event['event'], Event['storeName']> = {
            storeName: this.storeName,
            event: eventType,
            payload: payload,
            thenPromise: thenPromise
        };
        const key = `${this.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if ((arrEventHandlers === undefined) || (arrEventHandlers?.length === 0)) {
            if ((event.event === "attach") || (event.event === "detach") || (event.event === "value")) {
            } else {
                dsLog.warnACME("DS", "DSValueStore", "emitEvent", key, "No event registered for listening");
            }
        } else if (this.storeManager === undefined) {
            dsLog.warnACME("DS", "DSValueStore", "emitEvent", key, "this.storeManager is undefined");
            return this.processEvent(event);
        } else {
            return this.storeManager.emitEvent(event);
        }
    }

    public listenEvent<
        Event extends DSEvent<any, string, StoreName>
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        const key = `${this.storeName}/${event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            this.mapEventHandlers.set(key, [{ msg: msg, handler: callback as DSEventHandler }]);
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.concat([{ msg: msg, handler: callback as DSEventHandler }]));
        }
        this.storeManager?.resetRegisteredEvents();
        return this.unlistenEvent.bind(this, { storeName: this.storeName, event: event }, callback as DSEventHandler);
    }

    /*
    public listenEventAnyStore<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(msg: string, event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): DSUnlisten {
        const key = `${event.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            this.mapEventHandlers.set(key, [{ msg: msg, handler: callback as DSEventHandler }]);
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.concat([{ msg: msg, handler: callback as DSEventHandler }]));
        }
        if ((event.storeName as string) === (this.storeName as string)) {
            // 'internal'
        } else {
            this.listenToAnyStore = true;
        }
        this.storeManager?.resetRegisteredEvents();
        return this.unlistenEvent.bind(this, { storeName: event.storeName, event: event.event }, callback as DSEventHandler);
    }
    */

    public unlistenEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEventName<EventType, StoreName>, callback: DSEventHandler<Payload, EventType, StoreName>): void {
        const key = `${event.storeName}/${event.event}`;
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            // should not be
        } else {
            this.mapEventHandlers.set(key, arrEventHandlers.filter(cb => cb.handler !== callback));
        }
    }

    public processEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>): DSEventHandlerResult {
        const key = `${event.storeName}/${event.event}`;
        let r: DSEventHandlerResult;
        let result: undefined | Promise<any>[];
        let arrEventHandlers = this.mapEventHandlers.get(key);
        if (arrEventHandlers === undefined) {
            // nobody is listening
            if (dsLog.enabled) {
                dsLog.infoACME("DS", "DSValueStore", "processEvent", `${event.storeName}/${event.event}`, "/nobody is listening");
            }
        } else {
            for (const { msg, handler: callback } of arrEventHandlers) {
                if (dsLog.enabled) {
                    dsLog.infoACME("DS", "DSValueStore", "processEvent", `${event.storeName}/${event.event}`, `/with ${msg}`);
                }
                if (r === undefined) {
                    r = callback(event);
                } else {
                    r = r.catch((reason) => {
                        debugger;
                        console.error(reason);
                    }).then(
                        () => { return callback(event); }
                    );
                }
            }
        }
        if (r == undefined) {
            return;
        } else {
            return r.catch((reason) => {
                debugger;
                console.error(reason);
            });
        }
    }
}