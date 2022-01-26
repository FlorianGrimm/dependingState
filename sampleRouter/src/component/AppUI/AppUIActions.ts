import { storeBuilder } from "dependingState";
import type { AppUIStore } from "./AppUIStore";
//
export const appUIStoreBuilder = storeBuilder<AppUIStore['storeName']>("AppUIStore");
export const useNavigatorA = appUIStoreBuilder.createAction<string>("useNavigatorA");
export const useNavigatorB = appUIStoreBuilder.createAction<string>("useNavigatorB");
//