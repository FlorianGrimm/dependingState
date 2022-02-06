import { storeBuilder } from "dependingState";
import type { AppUIStore } from "./AppUIStore";
//
export const appUIStoreBuilder = storeBuilder<AppUIStore['storeName']>("AppUIStore");
