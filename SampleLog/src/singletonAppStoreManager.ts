import { AppStoreManager } from "./store/AppStoreManager";

var appStoreManager: AppStoreManager;

export function setAppStoreManager(v: AppStoreManager) {
    appStoreManager = v;    
}
export function getAppStoreManager(): AppStoreManager {
    return appStoreManager;
}
