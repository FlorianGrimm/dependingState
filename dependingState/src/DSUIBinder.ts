import type React from "react";
import type { DSUIProps } from "./types";

export type DSUIViewStateVersion<
    Key extends string = "stateVersion"
    > = {
        [K in Key]: number;
    }

export type DSUIBinderType<Key extends string, Component> = {
    add<
        NextKey extends string,
        P extends DSUIProps<Value> = DSUIProps<any>,
        Value = ReturnType<P['getRenderProps']>,
        >(stateVersionName: NextKey, props: P): DSUIBinderType<Key | NextKey, Component>;

    bindHandleAll(): DSUIBinderType<Key, Component>;

    bindHandle<K extends keyof Component>(fnName: K | (K[])): DSUIBinderType<Key, Component>;

    setComponentWillUnmount(): DSUIBinderType<Key, Component>;

    getState(): DSUIViewStateVersion<Key>;

};

export class DSUIBinder<
    Component,
    P extends DSUIProps<Value>,
    Value,
    S
    > {
    component: React.Component<P, S>;
    props: P;
    arrUnwireStateVersion: undefined | ((component: React.Component<any, any, any>) => void)[]
    state: undefined | DSUIViewStateVersion<any>;

    constructor(
        component: React.Component<P, S>,
        props: P
    ) {
        this.component = component;
        this.props = props;
        this.state = {
            stateVersion: props.getStateVersion()
        };
        this.arrUnwireStateVersion = [];
        this.add("stateVersion", props);
    }

    add<
        NextKey extends string,
        Value1 = any,
        P1 extends DSUIProps<Value1> = any,
        >(
            stateVersionName: NextKey,
            nextProps: P1
        ): this {
        if (this.state === undefined) { throw new Error(`add must be called before getState. ${this.component.constructor.name}.`); }
        if (this.arrUnwireStateVersion === undefined) { throw new Error(`add must be called before setComponentWillUnmount or getUnbinder.${this.component.constructor.name}.`); }
        //this.state![stateVersionName] = nextProps.getStateVersion();
        this.state![stateVersionName] =nextProps.wireStateVersion(this.component as any, stateVersionName)
        this.arrUnwireStateVersion.push(nextProps.unwireStateVersion);
        return this;
    }

    bindHandleAll(): this {
        const p= Object.getPrototypeOf(this.component)
        for (const key of Object.getOwnPropertyNames(p)) {
            if (key.startsWith("handle")) {
                // console.log("bindHandleAll", key);
                if (Object.prototype.hasOwnProperty.call(p, key)) {
                    const fn = (p as any)[key];
                    if (typeof fn === "function") {
                        // console.log("bindHandleAll", key);
                        (this.component as any)[key] = fn.bind(this.component);
                    } else {
                        // console.log("bindHandleAll not", key);
                    }
                } else {
                    // console.log("bindHandleAll not", key);
                }
            }
        }
        return this;
    }

    bindHandle<K extends keyof Component>(fnName: K | (K[])): this {
        if (Array.isArray(fnName)) {
            for (const key in fnName) {
                if (Object.prototype.hasOwnProperty.call(this.component, key)) {
                    const fn = (this.component as any)[key];
                    if (typeof fn === "function") {
                        (this.component as any)[key] = fn.bind(this.component);
                    } else {
                        throw new Error(`${key}`)
                    }
                }
            }
        } else {
            const fn = (this.component as any)[fnName];
            (this.component as any)[fnName] = fn.bind(this.component);
        }
        return this;
    }

    setComponentWillUnmount(): this {
        if (this.state === undefined) { throw new Error(`setComponentWillUnmount must be called before getState. ${this.component.constructor.name}.`); }
        
        if (this.arrUnwireStateVersion === undefined) { throw new Error(`setComponentWillUnmount or getUnbinder can be called only once.${this.component.constructor.name}.`); }
        const arrUnwireStateVersion = this.arrUnwireStateVersion;
        this.arrUnwireStateVersion = undefined;
        const prevComponentWillUnmount = this.component.componentWillUnmount;
        this.component.componentWillUnmount = componentWillUnmountTemplate.bind(undefined, this.component, prevComponentWillUnmount, arrUnwireStateVersion);
        return this;
    }

    getUnbinder(): (() => void) {
        if (this.state === undefined) { throw new Error(`getUnbinder must be called before getState.${this.component.constructor.name}.`); }
        if (this.arrUnwireStateVersion === undefined) { throw new Error(`setComponentWillUnmount or getUnbinder can be called only once.${this.component.constructor.name}.`); }
        const arrUnwireStateVersion = this.arrUnwireStateVersion;
        this.arrUnwireStateVersion = undefined;
        const prevComponentWillUnmount = this.component.componentWillUnmount;
        return componentWillUnmountTemplate.bind(undefined, this.component, prevComponentWillUnmount, arrUnwireStateVersion);
    }
    
    getState<
    Key extends ("stateVersion" | string) = "stateVersion"
    >(): DSUIViewStateVersion<Key> {
        console.log("setComponentWillUnmount",this.component)
        if (this.state === undefined) { throw new Error(`getState cannot be called twice. ${this.component.constructor.name}.`); }
        if (this.arrUnwireStateVersion !== undefined) { throw new Error(`setComponentWillUnmount or getUnbinder must be called before getState.${this.component.constructor.name}.`); }
        const result = this.state;
        this.state = undefined;
        return result as any;
    }

}

export function bindUIComponent<
    Component extends React.Component<P, S>,
    P extends DSUIProps<Value>,
    Value,
    S
>(
    component: Component,
    props: P
): DSUIBinderType<"stateVersion", Component> {
    return  new DSUIBinder<Component, P, Value, S>(component, props);
}

function componentWillUnmountTemplate(
    component: React.Component<any, any>,
    prevComponentWillUnmount: (() => void) | undefined,
    arrUnwireStateVersion: ((component: React.Component<any, any, any>) => void)[]
): void {
    for (const unwireStateVersion of arrUnwireStateVersion) {
        unwireStateVersion(component);
    }
    if (prevComponentWillUnmount !== undefined) {
        prevComponentWillUnmount.call(component);
    }
}