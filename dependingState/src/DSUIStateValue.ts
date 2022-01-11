import type React from 'react';
import type {
    IDSUIStateValue,
    IDSStateValue,
    DSUIProps,
    DSUIViewStateBase
} from './types';

export class DSUIStateValue<Value = any> implements IDSUIStateValue<Value>{
    _ViewProps: undefined | DSUIProps<Value>;
    component: undefined | (React.Component<Value>) | (React.Component<Value>[]);
    stateValue: IDSStateValue<Value>;
    viewStateVersion: number;
    triggerScheduled: boolean;

    constructor(stateValue: IDSStateValue<Value>) {
        this.component = undefined;
        this.stateValue = stateValue;
        this.viewStateVersion = 0;
        this.triggerScheduled = false;
    }

    getViewProps(): DSUIProps<Value> {
        if (this._ViewProps === undefined) {
            const fnGetRenderProps: (() => Value) = (() => {
                return this.stateValue.value;
            });
            const fnWireStateVersion: ((component: React.Component<any>) => void) = ((
                component: React.Component<any>
            ) => {
                if (this.component === undefined) {
                    this.component = component;
                } else if (Array.isArray(this.component)) {
                    this.component.push(component);
                } else {
                    this.component = [this.component as React.Component<Value>, component];
                }
            });
            const fnUnwireStateVersion: ((component: React.Component<any>) => void) = ((
                component: React.Component<any>
            ) => {
                if (this.component === undefined) {
                    // done
                } else if (Array.isArray(this.component)) {
                    for (let idx = 0; idx < this.component.length; idx++) {
                        if (this.component[idx] === component) {
                            this.component.splice(idx, 1);
                            if (this.component.length === 1) {
                                this.component = this.component[0];
                            }
                            return;
                        }
                    }
                } else {
                    if (this.component === component) {
                        this.component = undefined;
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

    triggerUIUpdate(): void {
        const stateVersion = this.stateValue.stateVersion;
        if (this.component === undefined) {
            //
        } else {
            if (stateVersion === this.viewStateVersion) {
                //
            } else {
                this.viewStateVersion = stateVersion;
                if (this.component === undefined) {
                    //
                } else if (Array.isArray(this.component)) {
                    for (const component of this.component) {
                        component.setState({ stateVersion: stateVersion });

                        console.log("triggerUIUpdate", (component as any).constructor.name, stateVersion);
                    }
                } else {
                    this.component.setState({ stateVersion: stateVersion });

                    console.log("triggerUIUpdate", (this.component as any).constructor.name, stateVersion);
                }
            }
        }
    }
}