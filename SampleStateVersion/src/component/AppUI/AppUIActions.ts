import { storeBuilder } from "dependingState";

// the import type prevents that webpack add a depenency
import type { AppUIStore } from "./AppUIStore";

export const appUIStoreBuilder = storeBuilder<AppUIStore['storeName']>("AppUIStore");
export const loadData = appUIStoreBuilder.createAction<undefined>("loadData");
