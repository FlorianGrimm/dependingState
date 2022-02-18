import { storeBuilder } from "dependingState";

// the import type prevents that webpack add a depenency
import type { CounterStore } from "./CounterStore";

export const counterStoreBuilder = storeBuilder<CounterStore['storeName']>("CounterStore");
export const countDown = counterStoreBuilder.createAction<undefined>("countDown");
export const countUp = counterStoreBuilder.createAction<undefined>("countUp");
