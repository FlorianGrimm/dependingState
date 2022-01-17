import { storeBuilder } from "dependingState";
import type { PageAStore } from "./PageAStore";
//
export const pageAUIStoreBuilder = storeBuilder<PageAStore['storeName']>("PageAStore");
export const doSomething = pageAUIStoreBuilder.createAction<string>("DoSomething");
//