import type {
    DSEvent,
    DSEventHandler,
    DSEventHandlerResult,
    DSUIProps,
    DSUnlisten,
    IDSValueStore,
    IDSStateValue,
    IDSStoreManager,
    IDSUIStateValue,
    ConfigurationDSValueStore,
    IDSStoreBuilder,
    IDSAnyValueStore,
    IDSAnyValueStoreInternal,
    IDSValueStoreBase,
    DSEmitValueChangedHandler,
    DSEmitCleanedUpHandler,
    IDSValueStoreInternals,
    DSUIViewStateBase,
    DSComponentStateVersionName
} from './types'

//IDSStoreManagerInternal 

import {
    dsLog
} from './DSLog';
import { DSEventEntityVSValue, IDSStoreManagerInternal } from '.';

// State Value extends IDSStateValue<Value> = (Value extends IDSStateValue<Value> ? Value : IDSStateValue<Value>),

export class DSValueStore<
    Key,
    Value,
    StoreName extends string
    > implements IDSValueStore<Key, Value, StoreName>, IDSValueStoreInternals<Value> {
    private _isDirty: boolean;
    storeName: StoreName;
    storeManager: IDSStoreManager | undefined;
    stateVersion: number;
    mapEventHandlers: Map<string, { msg: string, handler: DSEventHandler<any, string, string> }[]>;
    arrValueChangedHandler: ({ msg: string, handler: DSEmitValueChangedHandler<Value> }[]) | undefined;
    arrCleanedUpRelated: ({ msg: string, valueStore: IDSValueStoreBase }[]) | undefined;
    arrCleanedUpHandler: ({ msg: string, handler: DSEmitCleanedUpHandler<IDSValueStoreBase> }[]) | undefined;
    setEffectiveEvents: Set<string> | undefined;
    configuration: ConfigurationDSValueStore<Value>;
    storeBuilder: IDSStoreBuilder<StoreName> | undefined;
    isProcessDirtyConfigured: boolean;
    arrComponentStateVersionName: undefined | (DSComponentStateVersionName) | (DSComponentStateVersionName[]);
    triggerScheduled: boolean;
    viewStateVersion: number;

    constructor(
        storeName: StoreName,
        configuration?: ConfigurationDSValueStore<Value>
    ) {
        this.storeName = storeName;
        this.storeManager = undefined;
        this.mapEventHandlers = new Map();
        this._isDirty = false;
        this.stateVersion = 1;
        this.isProcessDirtyConfigured = false;
        this.triggerScheduled = false;
        this.viewStateVersion = 0;

        if (configuration === undefined) {
            this.configuration = {};
        } else {
            this.configuration = { ...configuration };
        }
    }

    public get isDirty(): boolean {
        return this._isDirty;
    }

    /**
     * binds the events/actions from the storeBuilder to this valueStore 
     * @param storeBuilder the storeBuilder to bind
     */
    public setStoreBuilder(storeBuilder: IDSStoreBuilder<StoreName>): void {
        if (this.storeBuilder !== undefined) {
            throw new Error(`DS storeBuilder is already set ${this.storeName}`);
        }
        this.storeBuilder = storeBuilder;
        storeBuilder.bindValueStore(this);
    }

    /**
     * call all listenDirtyValue, listenCleanedUp, listenCleanedUpRelated and listenEvent.
     */
    public initializeStore(): void {
        this.stateVersion = this.storeManager!.getNextStateVersion(0);
        if (this.configuration.initializeStore !== undefined) {
            this.configuration.initializeStore();
        }
    }

    /**
     * called after initializeStore
     */
    public initializeRegisteredEvents(): void {
        this.isProcessDirtyConfigured = this.hasProcessDirtyConfigured();
    }

    /**
     * called after initializeRegisteredEvents
     */
    public validateRegisteredEvents(): void {
        if (this.arrCleanedUpRelated !== undefined) {
            if (!this.isProcessDirtyConfigured) {
                const relatedStoreNames = this.arrCleanedUpRelated.map(i => (i.valueStore as IDSAnyValueStoreInternal).storeName).join(", ");
                throw new Error(`${this.storeName}.processDirty (method or config) is not defined, but listenCleanedUpRelated was called from ${relatedStoreNames}.`);
            }
        }
    }

    /**
     * called after initializeStore (and after initializeRegisteredEvents)
     */
    public initializeBoot(): void {
        if (this.configuration.initializeBoot !== undefined) {
            this.configuration.initializeBoot();
        }
    }

    public hasProcessDirtyConfigured(): boolean {
        if (this.configuration.processDirty !== undefined) { return true; }
        if (!(this.processDirty === DSValueStore.prototype.processDirty)) { return true; }
        return false;
    }


    /**
     * gets all entities
     */
    public getEntities(): { key: Key, stateValue: IDSStateValue<Value> }[] {
        return [];
    }

    public getNextStateVersion(stateVersion: number): number {
        if (this.storeManager === undefined) {
            return (this.stateVersion = (Math.max(this.stateVersion, stateVersion) + 1));
        } else {
            return (this.stateVersion = this.storeManager.getNextStateVersion(stateVersion));
        }
    }

    public emitEvent<
        Event extends DSEvent<any, string, StoreName>
    >(
        eventType: Event['event'],
        payload: Event['payload']
    ): DSEventHandlerResult {
        const event: DSEvent<Event['payload'], Event['event'], Event['storeName']> = {
            storeName: this.storeName,
            event: eventType,
            payload: payload
        };
        let arrEventHandlers = this.mapEventHandlers.get(event.event);
        if ((arrEventHandlers === undefined) || (arrEventHandlers?.length === 0)) {
            if ((this.storeManager !== undefined) && (this.storeManager as IDSStoreManagerInternal).warnUnlistenEvents) {
                if ((event.event === "attach") || (event.event === "detach") || (event.event === "value")) {
                } else {
                    dsLog.warnACME("DS", "DSValueStore", "emitEvent", `${this.storeName}/${event.event}`, "No event registered for listening");
                }
            }
        } else if (this.storeManager === undefined) {
            dsLog.warnACME("DS", "DSValueStore", "emitEvent", `${this.storeName}/${event.event}`, "this.storeManager is undefined");
            return this.processEvent(event);
        } else {
            return this.storeManager.emitEvent(event);
        }
    }

    /**
     * returns if any eventhandler is registered for this event
     * @param event the eventname
     */
    public hasEventHandlersFor(event: string): boolean {
        const arrEventHandlers = this.mapEventHandlers.get(event);
        if (arrEventHandlers === undefined) {
            return false;
        } else {
            return (arrEventHandlers.length > 0);
        }
    }


    public listenEvent<
        Event extends DSEvent<any, string, StoreName>
    >(msg: string, event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): DSUnlisten {
        if (this.storeManager !== undefined) {
            if ((this.storeManager as IDSStoreManagerInternal).storeManagerState == 0) {
                throw new Error(`storeManagerState=0 has an unexpected value. Did you call all stores.attach?`);
            } else if ((this.storeManager as IDSStoreManagerInternal).storeManagerState == 1) {
                throw new Error(`storeManagerState=1 has an unexpected value. Did you call within initializeStore()?`);
            } else if ((this.storeManager as IDSStoreManagerInternal).storeManagerState == 2) {
                // OK
            } else if ((this.storeManager as IDSStoreManagerInternal).storeManagerState == 3) {
                throw new Error(`storeManagerState=1 has an unexpected value. Did you call within initializeStore()?`);
            } else if ((this.storeManager as IDSStoreManagerInternal).storeManagerState == 4) {
                throw new Error(`storeManagerState=1 has an unexpected value. Did you call within initializeStore()?`);
            } else {
                throw new Error(`storeManagerState=${(this.storeManager as IDSStoreManagerInternal).storeManagerState} has an unexpected value;`);
            }
        }
        let arrEventHandlers = this.mapEventHandlers.get(event);
        if (arrEventHandlers === undefined) {
            this.mapEventHandlers.set(event, [{ msg: msg, handler: callback as DSEventHandler }]);
        } else {
            this.mapEventHandlers.set(event, arrEventHandlers.concat([{ msg: msg, handler: callback as DSEventHandler }]));
        }
        this.storeManager?.resetRegisteredEvents();
        return this.unlistenEvent.bind(this, event, callback);
    }

    public unlistenEvent<
        Event extends DSEvent<any, string, StoreName>
    >(event: Event['event'], callback: DSEventHandler<Event['payload'], Event['event'], StoreName>): void {
        let arrEventHandlers = this.mapEventHandlers.get(event);
        if (arrEventHandlers === undefined) {
            // should not be
        } else {
            arrEventHandlers = arrEventHandlers.filter(cb => cb.handler !== callback);
            if (arrEventHandlers.length === 0) {
                this.mapEventHandlers.delete(event);
            } else {
                this.mapEventHandlers.set(event, arrEventHandlers);
            }
            this.storeManager?.resetRegisteredEvents();
        }
    }

    /**
     * internal
     * @param event 
     */
    public processEvent<
        Payload = any,
        EventType extends string = string,
        StoreName extends string = string
    >(event: DSEvent<Payload, EventType, StoreName>): DSEventHandlerResult {
        let r: DSEventHandlerResult;
        let result: undefined | Promise<any>[];
        let arrEventHandlers = this.mapEventHandlers.get(event.event);
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
                    try {
                        r = callback(event);
                    } catch (reason) {
                        debugger;
                        dsLog.error(msg, reason);
                    }
                } else {
                    r = r.catch((reason) => {
                        debugger;
                        dsLog.error(msg, reason);
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
                dsLog.error(reason);
            });
        }
    }

    /**
     * should be called after a value change - or willbe called from DSPropertiesChanged.valueChangedIfNeeded().
     * calls all callbacks - registed with listenDirtyValue - which can call setDirty if a relevant property was changed.
     * @param stateValue 
     * @param properties 
     */
    public emitValueChanged(msg: string, stateValue: IDSStateValue<Value>, properties?: Set<keyof Value>): void {
        if ((this.arrValueChangedHandler !== undefined) || (this.isProcessDirtyConfigured)) {
            if (dsLog.isEnabled("emitValueChanged")) {
                dsLog.infoACME("DS", "DSValueStore", "emitValueChanged", this.storeName);
            }
            if ((this.arrValueChangedHandler !== undefined)) {
                for (const valueChangedHandler of this.arrValueChangedHandler!) {
                    if (dsLog.enabled) {
                        dsLog.infoACME("DS", "DSValueStore", "emitValueChanged", valueChangedHandler.msg, "/dirtyHandler");
                    }
                    valueChangedHandler.handler(stateValue, properties);
                }
            }
            if (this.isProcessDirtyConfigured) {
                this.setDirty(msg ?? "emitValueChanged");
            }
        }
    }

    /**
     * register a callback that is called from emitDirtyValue.
     * @param msg the log message is logged before the callback is invoked.
     * @param callback the callback that will be called
     */
    public listenValueChanged(msg: string, callback: DSEmitValueChangedHandler<Value>): DSUnlisten {
        if (this.arrValueChangedHandler === undefined) {
            this.arrValueChangedHandler = [{ msg: msg, handler: callback }];
        } else {
            this.arrValueChangedHandler.push({ msg: msg, handler: callback });
        }
        return this.unlistenValueChanged.bind(this, callback);
    }

    /**
     * unregister the callback
     * @param callback the callback to unregister
     */
    public unlistenValueChanged(callback: DSEmitValueChangedHandler<Value>): void {
        if (this.arrValueChangedHandler !== undefined) {
            this.arrValueChangedHandler = this.arrValueChangedHandler.filter((cb) => cb.handler !== callback);
            if (this.arrValueChangedHandler.length === 0) {
                this.arrValueChangedHandler = undefined;
                // this.storeManager?.resetRegisteredEvents();
            }
        }
    }

    /**
     * set the isDirty flag and DSStoreManager.process will call processDirty
     * @param msg the message is logged if the store was not dirty
     */
    public setDirty(msg: string): void {
        if (this._isDirty) { return; }
        this._isDirty = true;
        if (this.storeManager === undefined) {
            dsLog.warnACME("DS", "DSValueStore", "setDirty", this.storeName, "storeManager is not set.");
        } else {
            this.storeManager.isDirty = true;
            dsLog.infoACME("DS", "DSValueStore", "setDirty", this.storeName, msg);
        }
    }

    /**
     *  DSStoreManager.process call this if setDirty was called before
     *  @returns true then emitCleanUp will be called
     */
    public processDirty(): boolean {
        if (this.configuration.processDirty !== undefined) {
            return this.configuration.processDirty.apply(this);
        } else {
            return false;
        }
    }

    /**
     * called after processDirty()
     */
    public postProcessDirty(processDirtyResult: boolean): void {
        this._isDirty = false;
        if (processDirtyResult) {
            this.emitCleanedUp();
        } else {
            //
        }
    }

    /**
     * would be called if processDirty returns true
     */
    public emitCleanedUp(): void {
        if (this.arrCleanedUpRelated !== undefined) {
            for (const cleanedUpRelated of this.arrCleanedUpRelated) {
                var relatedValueStore = cleanedUpRelated.valueStore as IDSAnyValueStoreInternal;
                relatedValueStore.setDirty(cleanedUpRelated.msg);
            }
        }
        if (this.arrCleanedUpHandler !== undefined) {
            for (const cleanedUpHandler of this.arrCleanedUpHandler) {
                cleanedUpHandler.handler(this);
            }
        }
    }

    /**
     * register a callback that is (directly) invoked by emitDirty
     * @param msg 
     * @param callback 
     */
    public listenCleanedUp(msg: string, callback: DSEmitCleanedUpHandler<Value>): DSUnlisten {
        const cleanedUpHandler = { msg: msg, handler: callback as any };
        if (this.arrCleanedUpHandler === undefined) {
            this.arrCleanedUpHandler = [cleanedUpHandler];
        } else {
            this.arrCleanedUpHandler.push(cleanedUpHandler);
        }
        return this.unlistenCleanedUp.bind(this, callback);
    }

    /**
     * unregister a callback
     * @param callback 
     */
    public unlistenCleanedUp(callback: DSEmitCleanedUpHandler<Value>): void {
        if (this.arrCleanedUpHandler !== undefined) {
            this.arrCleanedUpHandler = this.arrCleanedUpHandler.filter((item) => ((item.handler as any) !== callback));
            if (this.arrCleanedUpHandler.length === 0) {
                this.arrCleanedUpHandler = undefined;
            }
        }
    }

    /**
      * if this store gets cleanedup (processDirty returns true) the relatedValueStore gets dirty.
      * @param msg 
      * @param relatedValueStore 
      */
    public listenCleanedUpRelated(msg: string, relatedValueStore: IDSValueStoreBase): DSUnlisten {
        if (this.arrCleanedUpRelated === undefined) {
            this.arrCleanedUpRelated = [];
        }
        const index = this.arrCleanedUpRelated.findIndex((item) => (item.valueStore === relatedValueStore));
        if (index < 0) {
            this.arrCleanedUpRelated = (this.arrCleanedUpRelated || []).concat([{ msg: msg, valueStore: relatedValueStore as IDSAnyValueStore }]);
            return (() => { this.unlistenCleanedUpRelated(relatedValueStore); });
        } else {
            return (() => { });
        }
    }

    /**
     * unregister the relatedValueStore
     * @param relatedValueStore 
     */
    public unlistenCleanedUpRelated(relatedValueStore: IDSValueStoreBase): void {
        if (this.arrCleanedUpRelated !== undefined) {
            this.arrCleanedUpRelated = this.arrCleanedUpRelated.filter((item) => (item.valueStore !== relatedValueStore));
            if (this.arrCleanedUpRelated.length === 0) {
                this.arrCleanedUpRelated = undefined;
            }
        }
    }

    public emitUIUpdate(uiStateValue: IDSUIStateValue<Value>) {
        if (this.storeManager === undefined) {
            uiStateValue.triggerUIUpdate(this.stateVersion);
        } else {
            if ((this._ViewProps !== undefined) && !this.triggerUIUpdate) {
                this.storeManager.emitUIUpdate(this);
            }
            this.storeManager.emitUIUpdate(uiStateValue);
        }
    }


    public triggerUIUpdate(stateVersion: number): void {
        this.triggerScheduled = false;
        // const stateVersion = this.stateValue.stateVersion;
        // if (this.component === undefined) {
        //     //
        // } else {
        //     if (stateVersion === this.viewStateVersion) {
        //         //
        //         dsLog.info(`DSUIStateValue skip update same stateVersion: ${stateVersion}`)

        //     } else {
        this.viewStateVersion = stateVersion;
        const enabled = (dsLog.enabled && dsLog.isEnabled("triggerUIUpdate"));
        if (this.arrComponentStateVersionName === undefined) {
            //
        } else if (Array.isArray(this.arrComponentStateVersionName)) {
            for (const componentStateVersionName of this.arrComponentStateVersionName) {
                componentStateVersionName.component.setState({ [componentStateVersionName.stateVersionName]: stateVersion });
                if (enabled) {
                    dsLog.infoACME("DS", "DSUIStateValue", "triggerUIUpdate", dsLog.convertArg(componentStateVersionName));
                }
            }
        } else {
            this.arrComponentStateVersionName.component.setState({ [this.arrComponentStateVersionName.stateVersionName]: stateVersion });
            if (enabled) {
                dsLog.infoACME("DS", "DSUIStateValue", "triggerUIUpdate", dsLog.convertArg(this.arrComponentStateVersionName));
            }
        }
        //     }
        // }
    }


    _ViewProps: undefined | DSUIProps<this>;
    public getViewProps(): DSUIProps<this> {
        if (this._ViewProps === undefined) {
            const fnGetRenderProps: (() => this) = (() => {
                return this;
            });
            const fnWireStateVersion: ((component: React.Component<any>, stateVersionName?: string) => number) = ((
                component: React.Component<any>, stateVersionName?: string
            ) => {
                const csvn = { component: component, stateVersionName: stateVersionName ?? "stateVersion" };
                if (this.arrComponentStateVersionName === undefined) {
                    this.arrComponentStateVersionName = csvn;
                } else if (Array.isArray(this.arrComponentStateVersionName)) {
                    this.arrComponentStateVersionName.push(csvn);
                } else {
                    this.arrComponentStateVersionName = [this.arrComponentStateVersionName as DSComponentStateVersionName, csvn];
                }
                return this.stateVersion;
            });
            const fnUnwireStateVersion: ((component: React.Component<any>) => void) = ((
                component: React.Component<any>
            ) => {
                if (this.arrComponentStateVersionName === undefined) {
                    // done
                } else if (Array.isArray(this.arrComponentStateVersionName)) {
                    for (let idx = 0; idx < this.arrComponentStateVersionName.length; idx++) {
                        if (this.arrComponentStateVersionName[idx].component === component) {
                            this.arrComponentStateVersionName.splice(idx, 1);
                            if (this.arrComponentStateVersionName.length === 1) {
                                this.arrComponentStateVersionName = this.arrComponentStateVersionName[0];
                            }
                            return;
                        }
                    }
                } else {
                    if (this.arrComponentStateVersionName.component === component) {
                        this.arrComponentStateVersionName = undefined;
                    }
                }
            });
            const fnGetStateVersion: (() => number) = (() => {
                return this.stateVersion;
            });
            //
            this._ViewProps = {
                getRenderProps: fnGetRenderProps,
                wireStateVersion: fnWireStateVersion,
                unwireStateVersion: fnUnwireStateVersion,
                getStateVersion: fnGetStateVersion,
            };
        }
        return this._ViewProps!;
    }
}