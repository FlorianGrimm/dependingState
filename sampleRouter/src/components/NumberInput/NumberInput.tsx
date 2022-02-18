import React from "react";

type NumberInputProps = {
    n: number;
    setValue: (n: number) => void;
    inputStyle?: React.CSSProperties | undefined;
}; //DSUIProps<Project>;

type NumberInputState = {
    n: number;
    t: string;
} //& DSUIViewStateBase
    ;

export default class NumberInput extends React.Component<NumberInputProps, NumberInputState>{
    intervalHandle: number;
    watchDog: number;
    constructor(props: NumberInputProps) {
        super(props);
        this.intervalHandle = 0;
        this.watchDog = 0;
        this.state = {
            n: props.n,
            t: props.n.toString()
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleTicks = this.handleTicks.bind(this);

    }
    handleTicks() {
        this.watchDog--;
        if (this.watchDog <= 0) {
            window.clearInterval(this.intervalHandle);
            this.intervalHandle = 0;
            this.props.setValue(this.state.n);
        }
    }
    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const t = e.target.value;
        const n = (t === "") ? 0 : parseInt(t, 10);
        console.log("handleChange", t, n);
        const isValid = !Number.isNaN(n);
        if (isValid) {
            this.setState({ n, t });
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
        console.log("handleBlur", t, n);
        const isValid = !Number.isNaN(n);

        if (isValid) {
            this.setState({ n, t });
        } else {
            this.setState({ t });
        }
        if (this.intervalHandle <= 0) {
            //OK
        } else {
            window.clearInterval(this.intervalHandle);
            this.intervalHandle = 0;
        }
        if (isValid){
            this.props.setValue(n);
        }
    }
    render(): React.ReactNode {
        return (<input style={{...this.props.inputStyle}} value={this.state.t} onChange={this.handleChange} onBlur={this.handleBlur} />);
    }

}