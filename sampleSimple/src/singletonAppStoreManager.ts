import type { DSEventHandlerResult } from "dependingState";
import type { AppStoreManager } from "./services/AppStoreManager";

var appStoreManager: AppStoreManager;

export function setAppStoreManager(v: AppStoreManager) {
    appStoreManager = v;
}
export function getAppStoreManager(): AppStoreManager {
    return appStoreManager;
}
