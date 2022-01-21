import { storeBuilder } from "dependingState";
import type { PageBStore } from "./PageBStore";
//
export const pageBStoreBuilder = storeBuilder<PageBStore['storeName']>("PageBStore");
export const doSomething = pageBStoreBuilder.createAction<string>("DoSomething");
//