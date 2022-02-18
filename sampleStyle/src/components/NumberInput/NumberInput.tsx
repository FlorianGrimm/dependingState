import React from "react";

type NumberInputProps = {
    n: number;
    setValue: (n: number) => void;
    inputStyle?: React.CSSProperties | undefined;
}; //DSUIProps<Project>;

type NumberInputState = {
    idNumberInput: number;
    orginalN:number;
    nextN: number|undefined;
    t: string;
} //& DSUIViewStateBase
    ;
var countNumberInput = 0;
export default class NumberInput extends React.Component<NumberInputProps, NumberInputState>{
    intervalHandle: number;
    watchDog: number;
    constructor(props: NumberInputProps) {
        super(props);
        const idNumberInput = ++countNumberInput;
        this.intervalHandle = 0;
        this.watchDog=0;
        const state:NumberInputState={
            idNumberInput: idNumberInput,
            orginalN:undefined!,
            nextN: undefined,
            t: undefined!
        };
        this.state = {...state, ...NumberInput.getDerivedStateFromProps(props, state)! } ;
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleTicks = this.handleTicks.bind(this);        
    }
    static getDerivedStateFromProps(props:NumberInputProps, state:NumberInputState):null|Partial<NumberInputState>{
        if (props.n === state.orginalN){
            return null;
        } else{
            return {
                orginalN:props.n,
                t: props.n.toString(),
                nextN:undefined
            };
        }
    }

    handleTicks() {
        this.watchDog--;
        if (this.watchDog <= 0) {
            window.clearInterval(this.intervalHandle);
            this.intervalHandle = 0;
            const nextN = this.state.nextN;
            if (nextN!==undefined){
                this.props.setValue(nextN);
            }
        }
    }
    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const t = e.target.value;
        const n = (t === "") ? 0 : parseInt(t, 10);
        const isValid = !Number.isNaN(n);
        if (isValid) {
            this.setState({ nextN:n, t });
        } else {
            this.setState({ t });
        }
        if (isValid) {
            if (this.intervalHandle <= 0) {
                this.watchDog = 5;
                this.intervalHandle = window.setInterval(this.handleTicks, 500);
            }
        } else {
            if (this.intervalHandle <= 0) {
                //OK
            } else {
                window.clearInterval(this.intervalHandle);
                this.intervalHandle = 0;
            }
        }
    }
    handleBlur(e: React.FocusEvent<HTMLInputElement>) {
        const t = e.target.value;
        const n = parseInt(t, 10);
        const isValid = !Number.isNaN(n);

        if (isValid) {
            this.setState({ nextN:n, t });
        } else {
            this.setState({ t });
        }
        if (this.intervalHandle <= 0) {
            //OK
        } else {
            window.clearInterval(this.intervalHandle);
            this.intervalHandle = 0;
        }
        if (isValid) {
            this.props.setValue(n);
        }
    }
    render(): React.ReactNode {
        return (<input style={{ ...this.props.inputStyle }} value={this.state.t} onChange={this.handleChange} onBlur={this.handleBlur} />);
    }

}