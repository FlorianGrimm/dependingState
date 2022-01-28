import type React from 'react';
import { dsLog } from '.';
import type {
    IDSUIStateValue,
    IDSStateValue,
    DSUIProps
} from './types';

type ComponentStateVersionName = { component: React.Component<any>; stateVersionName: string; };

export class DSUIStateValue<Value = any> implements IDSUIStateValue<Value>{
    _ViewProps: undefined | DSUIProps<Value>;
    componentStateVersionName: undefined | (ComponentStateVersionName) | (ComponentStateVersionName[]);
    stateValue: IDSStateValue<Value>;
    viewStateVersion: number;
    triggerScheduled: boolean;

    constructor(stateValue: IDSStateValue<Value>) {
        this.componentStateVersionName = undefined;
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
                if (this.componentStateVersionName === undefined) {
                    this.componentStateVersionName = csvn;
                } else if (Array.isArray(this.componentStateVersionName)) {
                    this.componentStateVersionName.push(csvn);
                } else {
                    this.componentStateVersionName = [this.componentStateVersionName as ComponentStateVersionName, csvn];
                }
                return this.stateValue.stateVersion;
            });
            const fnUnwireStateVersion: ((component: React.Component<any>) => void) = ((
                component: React.Component<any>
            ) => {
                if (this.componentStateVersionName === undefined) {
                    // done
                } else if (Array.isArray(this.componentStateVersionName)) {
                    for (let idx = 0; idx < this.componentStateVersionName.length; idx++) {
                        if (this.componentStateVersionName[idx].component === component) {
                            this.componentStateVersionName.splice(idx, 1);
                            if (this.componentStateVersionName.length === 1) {
                                this.componentStateVersionName = this.componentStateVersionName[0];
                            }
                            return;
                        }
                    }
                } else {
                    if (this.componentStateVersionName.component === component) {
                        this.componentStateVersionName = undefined;
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