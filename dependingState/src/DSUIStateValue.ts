import type React from 'react';
import { dsLog } from '.';
import type {
    IDSUIStateValue,
    IDSStateValue,
    DSUIProps,
    DSComponentStateVersionName
} from './types';


export class DSUIStateValue<Value = any> implements IDSUIStateValue<Value>{
    _ViewProps: undefined | DSUIProps<Value>;
    arrComponentStateVersionName: undefined | (DSComponentStateVersionName) | (DSComponentStateVersionName[]);
    stateValue: IDSStateValue<Value>;
    viewStateVersion: number;
    triggerScheduled: boolean;

    constructor(stateValue: IDSStateValue<Value>) {
        this.arrComponentStateVersionName = undefined;
        this.stateValue = stateValue;
        this.viewStateVersion = 0;
        this.triggerScheduled = false;
    }

    getViewProps(): DSUIProps<Value> {
        if (this._ViewProps === undefined) {
            const fnGetRenderProps: (() => Value) = (() => {
                return this.stateValue.value;
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
                return this.stateValue.stateVersion;
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
                return this.stateValue.stateVersion;
            });
            //
            if ((typeof (this.stateValue.value as any).key == "string") || (typeof (this.stateValue.value as any).key == "number")) {
                this._ViewProps = {
                    getRenderProps: fnGetRenderProps,
                    wireStateVersion: fnWireStateVersion,
                    unwireStateVersion: fnUnwireStateVersion,
                    getStateVersion: fnGetStateVersion,
                    key: (this.stateValue.value as any).key
                };
            } else {
                this._ViewProps = {
                    getRenderProps: fnGetRenderProps,
                    wireStateVersion: fnWireStateVersion,
                    unwireStateVersion: fnUnwireStateVersion,
                    getStateVersion: fnGetStateVersion,
                };
            }
        }
        return this._ViewProps!;
    }

    
    triggerUIUpdate(stateVersion: number): void {
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
            if (enabled) {
                dsLog.infoACME("DS", "DSUIStateValue", "triggerUIUpdate", "no component");
            }
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

    /*
        triggerUIUpdate(stateVersion: number): void {
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
            if (this.componentStateVersionName === undefined) {
                //
            } else if (Array.isArray(this.componentStateVersionName)) {
                for (const component of this.componentStateVersionName) {
                    component.setState({ stateVersion: stateVersion });
                    if (dsLog.enabled) {
                        dsLog.infoACME("DS", "DSUIStateValue", "triggerUIUpdate", dsLog.convertArg(component));
                    }
                }
            } else {
                this.componentStateVersionName.setState({ stateVersion: stateVersion });

                if (dsLog.enabled) {
                    dsLog.infoACME("DS", "DSUIStateValue", "triggerUIUpdate", dsLog.convertArg(this.componentStateVersionName));
                }
            }
            //     }
            // }
        }
    */
    toString(): string {
        if (typeof (this.stateValue.value as any).toString === "function") {
            return (this.stateValue.value as any).toString();
        }
        if (typeof (this.stateValue as any).toString === "function") {
            return this.stateValue.toString();
        }
        return `${this.stateValue}`;
    }
}