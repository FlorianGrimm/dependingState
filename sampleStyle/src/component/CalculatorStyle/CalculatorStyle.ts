// hint1: file found
// normally I would split the file - but for a quick overview..

import {
    DSLooseStore,
    DSStateValueSelf,
    storeBuilder
} from "dependingState";

const rootStyle1: React.CSSProperties = {
    backgroundColor: "red",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};
const rootStyle2: React.CSSProperties = {
    backgroundColor: "yellow",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};
const rootStyle3: React.CSSProperties = {
    backgroundColor: "green",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};
const rootStyle4: React.CSSProperties = {
    backgroundColor: "blue",
    borderColor: "black",
    borderRadius: 5,
    borderStyle: "solid",
    padding: 20,
};

export const calculatorStyleBuilder = storeBuilder<CalculatorStyleStore['storeName']>("CalculatorStyleStore");

export const rotateColors = calculatorStyleBuilder.createAction<undefined>("rotateColors");

export class CalculatorStyleValue extends DSStateValueSelf<CalculatorStyleValue>{
    rootStyle: React.CSSProperties;
    constructor() {
        super();
        this.rootStyle = {};
    }
}

export class CalculatorStyleStore extends DSLooseStore<CalculatorStyleValue, "CalculatorStyleStore">{
    style1: CalculatorStyleValue;
    style2: CalculatorStyleValue;
    style3: CalculatorStyleValue;
    style4: CalculatorStyleValue;
    
    constructor() {
        super("CalculatorStyleStore");
        
        this.style1 = new CalculatorStyleValue();
        this.style2 = new CalculatorStyleValue();
        this.style3 = new CalculatorStyleValue();
        this.style4 = new CalculatorStyleValue();
        
        // hint2 this is missing calculatorStyleBuilder.bindValueStore(this);
    }
    
    public postAttached(): void {
        super.postAttached();
        this.style1.rootStyle = rootStyle1;
        this.style1.setStore(this);
        this.style2.rootStyle = rootStyle2;
        this.style2.setStore(this);
        this.style3.rootStyle = rootStyle3;
        this.style3.setStore(this);
        this.style4.rootStyle = rootStyle4;
        this.style4.setStore(this);

        rotateColors.listenEvent("handle rotateColors", (e)=>{
            const style1 = this.style1.rootStyle;
            const style2 = this.style2.rootStyle;
            const style3 = this.style3.rootStyle;
            const style4 = this.style4.rootStyle;

            this.style1.rootStyle = {...style1, backgroundColor:style4.backgroundColor};
            this.style2.rootStyle = {...style2, backgroundColor:style1.backgroundColor};
            this.style3.rootStyle = {...style3, backgroundColor:style2.backgroundColor};
            this.style4.rootStyle = {...style4, backgroundColor:style3.backgroundColor};

            this.style1.valueChanged();
            this.style2.valueChanged();
            this.style3.valueChanged();
            this.style4.valueChanged();
        });
    }
}