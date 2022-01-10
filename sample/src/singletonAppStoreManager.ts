import { DSReactContext } from "../../dependingState/src/DSReactContext";
import { AppStoreManager } from "./store/AppStoreManager";

var appStoreManager: AppStoreManager;
var dsReactContext: DSReactContext<AppStoreManager>;

export function setAppStoreManager(v: AppStoreManager) {
    appStoreManager = v;    
    dsReactContext = new DSReactContext(appStoreManager);

}
export function getAppStoreManager(): AppStoreManager {
    return appStoreManager;
}
export function getReactContext(): DSReactContext<AppStoreManager> {
    return dsReactContext;
}
