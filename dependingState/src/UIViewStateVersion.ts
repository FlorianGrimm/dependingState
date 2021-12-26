import { 
    FnGetStateVersion, 
    FnGetValue, 
    FnSetStateVersion, 
    FnSetValue, 
    IViewStateVersion, 
    UIProps, 
    UIPropsGetViewProps
} from "./types";

/*
export class UIViewStateVersionContainer<TUIProps = any>{
    fnGetValue: () => TUIProps;
    fnSetValue: (value: TUIProps) => void;
    fnGetStateVersion: FnGetStateVersion<TUIProps>;
    uiViewStateVersion: UIViewStateVersion<TUIProps>;

    constructor(
        getValue: () => TUIProps,
        setValue: (value: TUIProps) => void,
        getStateVersion: FnGetStateVersion<TUIProps>
    ) {
        this.fnGetValue = getValue;
        this.fnSetValue = setValue;
        this.fnGetStateVersion = getStateVersion;
        this.uiViewStateVersion = new UIViewStateVersion<TUIProps>(getValue(), getStateVersion);
    }

    getUIViewStateVersion(): UIViewStateVersion<TUIProps> {
        return this.uiViewStateVersion;
    }
}
*/

export class UIViewStateVersion<TUIProps = any> implements IViewStateVersion{
    getValueSV: FnGetValue<TUIProps>;
    setValueSV: FnSetValue<TUIProps>;
    value: TUIProps | undefined;
    stateVersion: number | undefined;
    _ViewProps: UIProps<TUIProps> | undefined;
    component: undefined | (React.Component<TUIProps>) | (React.Component<TUIProps>[]);

    constructor(
        getValueSV: FnGetValue<TUIProps>,
        setValueSV: FnSetValue<TUIProps>
        ) {
        this.getValueSV = getValueSV;
        this.setValueSV = setValueSV;
        this.value = undefined;
        this.stateVersion = 0;
        this.component = undefined;
        this._ViewProps = undefined;
    }

    getViewProps(): UIProps<TUIProps> {
        const {instance, stateVersion: viewStateVersion} = this.getValueSV();
        if (this._ViewProps !== undefined) {
            if (this._ViewProps.stateVersion !== viewStateVersion){
                this._ViewProps = undefined;
            }
        }
        if (this._ViewProps === undefined) {
            const fnGetViewProps: UIPropsGetViewProps<TUIProps> = (() => {
                //return this.getValueSV().instance;
                return instance;
            });
            const fnWireStateVersion: ((component: React.Component<TUIProps>) => void) = ((
                component: React.Component<TUIProps>
            ) => {
                if (this.component === undefined) {
                    this.component = component;
                } else if (Array.isArray(this.component)) {
                    this.component.push(component);
                } else {
                    this.component = [this.component as React.Component<TUIProps>, component];
                }
                //return this.getStateVersion(this.value);
            });
            const fnUnwireStateVersion: ((component: React.Component<TUIProps>) => void) = ((
                component: React.Component<TUIProps>
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
            //
            this._ViewProps = {
                getViewProps: fnGetViewProps,
                wireStateVersion: fnWireStateVersion,
                unwireStateVersion: fnUnwireStateVersion,
                stateVersion: viewStateVersion,
            };
        }
        return this._ViewProps;
    }

    trigger() {
        const {instance, stateVersion: viewStateVersion} = this.getValueSV();
        if (this.component === undefined) {
            //
        } else {
            if (viewStateVersion === this.stateVersion) {
                //
            } else {
                this.stateVersion = viewStateVersion;
                if (this.component === undefined){
                    //
                } else if (Array.isArray(this.component)) {                    
                    for (const component of this.component) {
                        component.setState({ stateVersion: viewStateVersion });    
                    }
                } else {
                    this.component.setState({ stateVersion: viewStateVersion });
                }
            }
        }
    }
}

