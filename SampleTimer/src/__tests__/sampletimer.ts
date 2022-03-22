import { dsLog } from "dependingState";
import { timerStopGo } from "~/components/AppUI/AppUIActions";
import { AppUIStore } from "~/components/AppUI/AppUIStore";
import { AppUIValue } from "~/components/AppUI/AppUIValue";
import { TimerStore } from "~/components/Timer/TimerStore";
import { setAppStoreManager } from "~/singletonAppStoreManager";
import { AppStoreManager } from "~/services/AppStoreManager";

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
