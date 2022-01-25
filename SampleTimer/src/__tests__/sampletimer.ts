import { dsLog } from "dependingState";
import { timerStopGo } from "~/component/AppUI/AppUIActions";
import { AppUIStore } from "~/component/AppUI/AppUIStore";
import { AppUIValue } from "~/component/AppUI/AppUIValue";
import { TimerStore } from "~/component/Timer/TimerStore";
import { setAppStoreManager } from "~/singletonAppStoreManager";
import { AppStoreManager } from "~/store/AppStoreManager";

test("stop and go", () => {
    dsLog.initialize("disabled");

    // create all stores
    const appUIStore = new AppUIStore(new AppUIValue());
    const timerStore = new TimerStore();

    // create appStoreManager
    const appStoreManager = new AppStoreManager(
        appUIStore,
        timerStore,
    );
    setAppStoreManager(appStoreManager);
    dsLog.attach(appStoreManager);
    appStoreManager.initialize();

    timerStopGo.emitEventAndProcess("go", true);
    expect(appUIStore.stateValue.value.isRunnging).toBe(true);

    timerStopGo.emitEventAndProcess("stop", false);
    expect(appUIStore.stateValue.value.isRunnging).toBe(false);
});
/*

*/