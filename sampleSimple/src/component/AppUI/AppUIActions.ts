import { storeBuilder } from "dependingState";
import type { AppUIStore } from "./AppUIStore";

export const appUIStoreBuilder = storeBuilder<AppUIStore['storeName']>("AppUIStore");
export const countDown = appUIStoreBuilder.createAction<undefined>("countDown");
export const countUp = appUIStoreBuilder.createAction<undefined>("countUp");
