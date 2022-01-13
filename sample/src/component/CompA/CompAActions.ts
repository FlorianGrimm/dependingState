import { storeBuilder } from "dependingState";
import { Project } from "../../types";
import type { CompAStore } from "./CompAStore";
//
export const compAUIStoreBuilder = storeBuilder<CompAStore['storeName']>("CompAStore");
export const hugo = compAUIStoreBuilder.createAction<Project>("hugo");
//