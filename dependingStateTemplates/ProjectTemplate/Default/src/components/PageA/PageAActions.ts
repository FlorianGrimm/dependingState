import { storeBuilder } from "dependingState";
import type { PageAStore } from "./PageAStore";
//
export const pageAStoreBuilder = storeBuilder<PageAStore['storeName']>("PageAStore");
export const doSomething = pageAStoreBuilder.createAction<string>("DoSomething");
//