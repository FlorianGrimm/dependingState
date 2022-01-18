import { storeBuilder } from "dependingState";
import { Project } from "../../types";
import type { CompAStore } from "./CompAStore";
//
export const compAUIStoreBuilder = storeBuilder<CompAStore['storeName']>("CompAStore");
export const changeProjectName = compAUIStoreBuilder.createAction<Project>("changeProjectName");
//