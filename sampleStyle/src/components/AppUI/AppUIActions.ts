import { storeBuilder } from "dependingState";
import type { AppUIStore } from "./AppUIStore";
//import type { AppUIValue } from "./AppUIValue";

export const appUIStoreBuilder = storeBuilder<AppUIStore['storeName']>("AppUIStore");

//export const clearInput = appUIStoreBuilder.createAction<CalculatorValue>("clearInput");
