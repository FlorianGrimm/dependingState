import { storeBuilder } from "dependingState";
import type { PageAStore } from "./PageAStore";
//
export const pageAStoreBuilder = storeBuilder<PageAStore['storeName']>("PageAStore");
export const pageALoadData = pageAStoreBuilder.createAction<undefined>("pageALoadData");
export const pageANavigate = pageAStoreBuilder.createAction<{ a: number, b: number } | undefined>("pageANavigate");
//
