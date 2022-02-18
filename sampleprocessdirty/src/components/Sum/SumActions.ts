import { storeBuilder } from "dependingState";

// the import type prevents that webpack add a depenency
import type { SumStore } from "./SumStore";

export const sumStoreBuilder = storeBuilder<SumStore['storeName']>("SumStore");
