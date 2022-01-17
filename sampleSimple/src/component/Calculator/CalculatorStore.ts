import { DSEvent, dsLog, DSObjectStore, getPropertiesChanged } from "dependingState";
import { IAppStoreManager } from "../../store/AppStoreManager";
import { calculatorStoreBuilder, clearInput } from "./CalculatorActions";
import { CalculatorValue } from "./CalculatorValue";

export class CalculatorStore extends DSObjectStore<CalculatorValue, CalculatorValue, "CalculatorStore">{
    constructor() {
        super("CalculatorStore", new CalculatorValue());
        this.setStoreBuilder(calculatorStoreBuilder);
    }

    public postAttached(): void {
        clearInput.listenEvent("handle clearInput", (e) => {
            // valueChanged is used 
            // or if you expect many related effects you can use valueChangedIfNeeded

            /* case valueChanged */
            // set all props to 0
            this.stateValue.nbrA = 0;
            this.stateValue.nbrB = 0;
            this.stateValue.nbrC = 0;

            // unconditionally call valueChanged
            this.stateValue.valueChanged();
            /* / case valueChanged */

            /* case valueChangedIfNeeded */
            /*
            const stateValuePC = getPropertiesChanged(this.stateValue);
            stateValuePC.setIf("nbrA", 0);
            stateValuePC.setIf("nbrB", 0);
            stateValuePC.setIf("nbrC", 0);

            // conditionally call valueChanged
            stateValuePC.valueChangedIfNeeded();
            */
            /* case valueChangedIfNeeded */
        });
        this.listenEventValue("a+b=c", (e) => {
            const { properties, entity:calculatorValue } = e.payload;
            // since DSObjectStore is used calculatorValue and this.stateValue is the same.
            // but if DSArrayStore or DSEntityStore is used this is not true (since they use an array or map).

            if (properties === undefined || properties.has("nbrA") || properties.has("nbrB")) {
                const calculatorValuePC = getPropertiesChanged(calculatorValue);
                const nbrC = calculatorValue.nbrA + calculatorValue.nbrB;
                calculatorValuePC.setIf("nbrC", nbrC);
                calculatorValuePC.valueChangedIfNeeded();
                // valueChangedIfNeeded calls valueChanged if needed
            }
        });
    }
}
