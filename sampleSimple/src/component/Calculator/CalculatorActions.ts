import { storeBuilder } from "dependingState";
import type { CalculatorStore } from "./CalculatorStore";
import type { CalculatorValue } from "./CalculatorValue";

export const calculatorStoreBuilder = storeBuilder<CalculatorStore['storeName']>("CalculatorStore");
export const clearInput = calculatorStoreBuilder.createAction<CalculatorValue>("clearInput");
