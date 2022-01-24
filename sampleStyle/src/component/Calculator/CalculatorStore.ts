import { DSObjectStore, getPropertiesChanged, hasChangedProperty } from "dependingState";
import { calculatorStoreBuilder, clearInput } from "./CalculatorActions";
import { CalculatorValue } from "./CalculatorValue";

export class CalculatorStore extends DSObjectStore< CalculatorValue, "CalculatorStore">{
    constructor() {
        super("CalculatorStore", new CalculatorValue());
        this.setStoreBuilder(calculatorStoreBuilder);
    }

    public initializeStore(): void {
        clearInput.listenEvent("handle clearInput", (e) => {
            // valueChanged is used 
            // or if you expect many related effects you can use valueChangedIfNeeded

            /* region case valueChanged */
            // set all props to 0
            const v=this.stateValue.value
            v.nbrA = 0;
            v.nbrB = 0;
            v.nbrC = 0;

            // unconditionally call valueChanged
            this.stateValue.valueChanged();
            /* endregion case valueChanged */

            /* region case valueChangedIfNeeded */
            /*
            const stateValuePC = getPropertiesChanged(this.stateValue);
            stateValuePC.setIf("nbrA", 0);
            stateValuePC.setIf("nbrB", 0);
            stateValuePC.setIf("nbrC", 0);

            // conditionally call valueChanged
            stateValuePC.valueChangedIfNeeded();
            */
            /* endregion case valueChangedIfNeeded */
        });
        this.listenEventValue("a+b=c", (e) => {
            const { properties, entity:calculatorValue } = e.payload;
            // since DSObjectStore is used calculatorValue and this.stateValue is the same.
            // but if DSArrayStore or DSEntityStore is used this is not true (since they use an array or map).
            
            //if (properties === undefined || properties.has("nbrA") || properties.has("nbrB"))
            // this is the same as
            // if (hasChangedProperty(properties, "nbrA", "nbrB")) 

            if (hasChangedProperty(properties, "nbrA", "nbrB")) {
                const calculatorValuePC = getPropertiesChanged(calculatorValue);
                const nbrC = calculatorValue.value.nbrA + calculatorValue.value.nbrB;
                calculatorValuePC.setIf("nbrC", nbrC);
                calculatorValuePC.valueChangedIfNeeded();
                // valueChangedIfNeeded calls valueChanged if needed
            }
        });
    }
}
