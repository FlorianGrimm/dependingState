import { storeBuilder } from "dependingState";
import type { CalculatorStyleStore } from "./CalculatorStyleStore";

export const calculatorStyleBuilder = storeBuilder<CalculatorStyleStore['storeName']>("CalculatorStyleStore");

export const rotateColors = calculatorStyleBuilder.createAction<undefined>("rotateColors");