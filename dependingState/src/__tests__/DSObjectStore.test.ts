import {
    DSObjectStore,
    DSStoreManager,
    DSEventValue,
    stateValue,
    DSStateValue,
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

    const storeManager = new DSStoreManager();
    const valueStoreA = new DSObjectStore<DSStateValue<VSA>>("a", stateValue({ a: actA }));
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    const valueA = valueStoreA.stateValue;
    expect(valueA.store).toBe(valueStoreA);

    const unlisten = valueStoreA.listenEventValue("test", (dsEvent) => {
        actHit = true;
        actA = dsEvent.payload.entity.value.a;
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

    const storeManager = new DSStoreManager();
    const valueStoreA = new DSObjectStore<DSStateValue<VSA>>("a", stateValue({ a: actA }));
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    const valueA = valueStoreA.stateValue;
    expect(valueA.store).toBe(valueStoreA);

    //const valueB = valueStoreA.create({ a: 2 });
    const unlisten = valueStoreA.listenEventValue("test", (dsEvent) => {
        actHit = true;
        actA = dsEvent.payload.entity.value.a;
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
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSObjectStore<DSStateValue<VSA>>("a", stateValue( { a: 0 }));
    const valueStoreB = new DSObjectStore<DSStateValue<VSB>>("b", stateValue({ b: 0 }));
    const valueStoreAB = new DSObjectStore<DSStateValue<VSAB>>("ab", stateValue({ a: 0, b: 0, cnt: 0 }));
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.stateValue;
    const valueB = valueStoreB.stateValue;
    const valueAB = valueStoreAB.stateValue;

    const unlistenA = valueStoreA.listenEventValue("test", (dsEvent) => {
        valueAB.value.a = dsEvent.payload.entity.value.a;
        valueAB.value.cnt++;
        valueAB.valueChanged();
    });
    const unlistenB = valueStoreB.listenEventValue("test", (dsEvent) => {
        valueAB.value.b = dsEvent.payload.entity.value.b;
        valueAB.value.cnt++;
        valueAB.valueChanged();
    });

    valueA.value = { a: 1 };
    valueB.value = { b: 2 };

    expect(valueAB.value).toStrictEqual({ a: 1, b: 2, cnt: 2 });

    unlistenA();
    unlistenB();
});


test('DSObjectStore process promise', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSObjectStore<DSStateValue<VSA>>("a", stateValue({ a: 0 }));
    const valueStoreB = new DSObjectStore<DSStateValue<VSB>>("b", stateValue({ b: 0 }));
    const valueStoreAB = new DSObjectStore<DSStateValue<VSAB>>("ab", stateValue({ a: 0, b: 0, cnt: 0 }));
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.stateValue;
    const valueB = valueStoreB.stateValue;
    const valueAB = valueStoreAB.stateValue;

    const unlistenA = valueStoreA.listenEventValue("test", (dsEvent) => {
        valueAB.value.a = dsEvent.payload.entity.value.a;
        valueAB.value.cnt = valueAB.value.cnt * 10 + 1;
        var result = new Promise((resolve) => {
            setTimeout(() => { valueAB.valueChanged(); }, 200);
            resolve(undefined);
        });
        return result;
    });
    const unlistenB = valueStoreB.listenEventValue("test", (dsEvent) => {
        valueAB.value.b = dsEvent.payload.entity.value.b;
        valueAB.value.cnt = valueAB.value.cnt * 100 + 2;
        var result = new Promise((resolve) => {
            setTimeout(() => { valueAB.valueChanged(); }, 50);
            resolve(undefined);
        });
        return result;
    });

    await storeManager.process("test", () => {
        valueA.value = { a: 1 };
        valueB.value = { b: 2 };
    });

    expect(valueAB.value).toStrictEqual({ a: 1, b: 2, cnt: 100 * 1 + 2 });

    unlistenA();
    unlistenB();
});
