import { dsLog } from "../DSLog";
import {
    DSObjectStore,
    DSStoreManager,
    stateValue,
} from "../index";

type VSA = {
    a: number;
}

type VSB = {
    b: number;
}
type VSAB = {
    a: number;
    b: number;
    cnt: number;
}

test('DSObjectStore process implicit', async () => {
    let actHit = false;
    let actA = 1;

    dsLog.initialize("disabled");
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSObjectStore<VSA>("a", stateValue({ a: actA }));
    storeManager.attach(valueStoreA);
    storeManager.initialize();
    expect(valueStoreA.storeManager).toBe(storeManager);

    const valueA = valueStoreA.stateValue;
    expect(valueA.store).toBe(valueStoreA);

    const unlisten = valueStoreA.listenEventValue("test", (dsEvent) => {
        actHit = true;
        actA = dsEvent.payload.entity!.value.a;
    });

    valueA.value = { a: 11 };

    expect(storeManager.events.length).toBe(0);

    expect(actHit).toBe(true);
    expect(actA).toBe(11);

    valueA.value = { a: 22 };
    expect(actA).toBe(22);

    unlisten();

    valueA.value = { a: 33 };
    expect(actA).toBe(22);
});


test('DSObjectStore process explicit', async () => {
    let actHit = false;
    let actA = 1;

    dsLog.initialize("disabled");
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSObjectStore<VSA>("a", stateValue({ a: actA }));
    storeManager.attach(valueStoreA);
    storeManager.initialize();
    expect(valueStoreA.storeManager).toBe(storeManager);

    const valueA = valueStoreA.stateValue;
    expect(valueA.store).toBe(valueStoreA);

    //const valueB = valueStoreA.create({ a: 2 });
    const unlisten = valueStoreA.listenEventValue("test", (dsEvent) => {
        actHit = true;
        actA = dsEvent.payload.entity!.value.a;
    });

    await storeManager.process("test", () => {
        valueA.value = { a: 2 };
        expect(storeManager.events.length).toBe(1);

        valueA.value = { a: 11 };
        expect(actA).toBe(1);
    });
    expect(actA).toBe(11);

    valueA.value = { a: 22 };
    expect(actA).toBe(22);

    unlisten();

    valueA.value = { a: 33 };
    expect(actA).toBe(22);
});


test('DSObjectStore listen', async () => {
    dsLog.initialize("enabled");
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSObjectStore<VSA>("a", stateValue({ a: 0 }));
    const valueStoreB = new DSObjectStore<VSB>("b", stateValue({ b: 0 }));
    const valueStoreAB = new DSObjectStore<VSAB>("ab", stateValue({ a: 0, b: 0, cnt: 0 }));
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);
    storeManager.initialize();

    const valueA = valueStoreA.stateValue;
    const valueB = valueStoreB.stateValue;
    const valueAB = valueStoreAB.stateValue;

    const unlistenA = valueStoreA.listenEventValue("testa", (dsEvent) => {
        valueAB.value.a = dsEvent.payload.entity!.value.a;
        valueAB.value.cnt++;
        valueAB.valueChanged("testa");
    });
    const unlistenB = valueStoreB.listenEventValue("testb", (dsEvent) => {
        valueAB.value.b = dsEvent.payload.entity!.value.b;
        valueAB.value.cnt++;
        valueAB.valueChanged("testb");
    });

    valueA.value = { a: 1 };
    valueB.value = { b: 2 };

    expect(valueAB.value).toStrictEqual({ a: 1, b: 2, cnt: 2 });

    unlistenA();
    unlistenB();
});

// npx jest --testNamePattern "DSObjectStore process promise"
test('DSObjectStore process promise', async () => {
    dsLog.initialize("enabled");
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSObjectStore<VSA>("a", stateValue({ a: 0 }));
    const valueStoreB = new DSObjectStore<VSB>("b", stateValue({ b: 0 }));
    const valueStoreAB = new DSObjectStore<VSAB>("ab", stateValue({ a: 0, b: 0, cnt: 0 }));
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.stateValue;
    const valueB = valueStoreB.stateValue;
    const valueAB = valueStoreAB.stateValue;

    storeManager.initialize(() => {
        valueStoreA.listenEventValue("testa", (dsEvent) => {
            var result = new Promise((resolve) => {
                setTimeout(() => { 
                    valueAB.value.a = dsEvent.payload.entity.value.a;
                    valueAB.value.cnt += dsEvent.payload.entity.value.a * 10+1;
                    valueAB.valueChanged("testa"); 
                    resolve(undefined);
                }, 200);
            });
            return result;
        });
        valueStoreB.listenEventValue("testb", (dsEvent) => {
            var result = new Promise((resolve) => {
                setTimeout(() => { 
                    valueAB.value.b = dsEvent.payload.entity!.value.b;
                    valueAB.value.cnt += dsEvent.payload.entity.value.b * 100+1;
                    valueAB.valueChanged("testb");
                    resolve(undefined);
                 }, 50);
            });
            return result;
        });
        return;
    }, () => {
        return;
    }
    );

    const p=storeManager.process("test", () => {
        valueA.value = { a: 1 };
        valueB.value = { b: 2 };
    });
    console.log("process done")
    if (p){ 
        await p;
        console.log("process awaited")

    }
    // await storeManager.processAsyncAllSettled();
    // console.log("processAsyncAllSettled done")

    expect(valueAB.value.a).toBe(1);
    expect(valueAB.value.b).toBe(2);
    expect(valueAB.value.cnt).toBe(212);
});
