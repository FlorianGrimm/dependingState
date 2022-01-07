import { AppStoreManager } from "./store/AppStoreManager";

var notNice: AppStoreManager;
export function setNotNice(v: AppStoreManager) {
    notNice = v;
}
export function getNotNice(): AppStoreManager {
    return notNice;
}
