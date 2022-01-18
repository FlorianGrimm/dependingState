import { storeBuilder } from "dependingState";
import type { PageBStore } from "./PageBStore";
//
export const pageAUIStoreBuilder = storeBuilder<PageBStore['storeName']>("PageBStore");
export const doSomething = pageAUIStoreBuilder.createAction<string>("DoSomething");
//