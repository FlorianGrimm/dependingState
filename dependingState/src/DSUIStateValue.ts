import type React from 'react';
import type { DSStateValue } from './DSStateValue';
import type { DSUIProps } from './types';

export class DSUIStateValue<Value=any>{
    _ViewProps: undefined | DSUIProps<Value>;
    component: undefined | (React.Component<Value>) | (React.Component<Value>[]);
    stateValue: DSStateValue<Value>;
    viewStateVersion: number;
    constructor(stateValue: DSStateValue<Value>) {
        this.component = undefined;
        this.stateValue = stateValue;
        this.viewStateVersion = 0;
    }

    getViewProps(): DSUIProps<Value> {
        if (this._ViewProps === undefined) {
            const fnGetViewProps: (() => Value) = (() => {
                return this.stateValue.value;
            });
            const fnWireStateVersion: ((component: React.Component<Value>) => void) = ((
                component: React.Component<Value>
            ) => {
                if (this.component === undefined) {
                    this.component = component;
                } else if (Array.isArray(this.component)) {
                    this.component.push(component);
                } else {
                    this.component = [this.component as React.Component<Value>, component];
                }
            });
            const fnUnwireStateVersion: ((component: React.Component<Value>) => void) = ((
                component: React.Component<Value>
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
            this._ViewProps = {
                getViewProps: fnGetViewProps,
                wireStateVersion: fnWireStateVersion,
                unwireStateVersion: fnUnwireStateVersion,
                getStateVersion: fnGetStateVersion,
            };
        }
        return this._ViewProps;
    }

    triggerUIUpdate() {
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
                    }
                } else {
                    this.component.setState({ stateVersion: stateVersion });
                }
            }
        }
    }
}