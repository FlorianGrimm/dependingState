import { storeBuilder } from "dependingState";
import type { PageBStore } from "./PageBStore";
//
export const pageBStoreBuilder = storeBuilder<PageBStore['storeName']>("PageBStore");
export const pageBLoadData = pageBStoreBuilder.createAction<undefined>("pageBLoadData");
export const pageBNavigate = pageBStoreBuilder.createAction<{a:number, b:number}|undefined>("pageBNavigate");
//