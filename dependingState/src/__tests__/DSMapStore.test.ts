import {
    DSMapStore,
    DSStoreManager,
    DSEventValue,
    DSEventAttach
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

test('DSMapStore process implicit', async () => {
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSMapStore<VSA, number>("a");
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    let actHit = false;
    let actA = 1;
    const valueA = valueStoreA.create(42, { a: actA });
    expect(valueA.store).toBe(valueStoreA);

    const unlisten = valueStoreA.listenEvent({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
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


test('DSMapStore process explicit', async () => {
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSMapStore<VSA>("a");
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    let actHit = false;
    let actA = 1;
    const valueA = valueStoreA.create(42, { a: actA });
    expect(valueA.store).toBe(valueStoreA);

    //const valueB = valueStoreA.create({ a: 2 });
    const unlisten = valueStoreA.listenEvent({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        actHit = true;
        actA = dsEvent.payload.entity.value.a;
    });

    await storeManager.process(() => {
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


test('DSMapStore listen', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSMapStore<VSA>("a");
    const valueStoreB = new DSMapStore<VSB>("b");
    const valueStoreAB = new DSMapStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.create(42, { a: 0 });
    const valueB = valueStoreB.create(42, { b: 0 });
    const valueAB = valueStoreAB.create(42, { a: 0, b: 0, cnt: 0 });

    const unlistenA = valueStoreA.listenEvent({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        valueAB.value.a = dsEvent.payload.entity.value.a;
        valueAB.value.cnt++;
        valueAB.valueChanged();
    });
    const unlistenB = valueStoreA.listenEvent({ storeName: "b", event: "value" }, (dsEvent: DSEventValue<VSB>) => {
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


test('DSMapStore process promise', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSMapStore<VSA>("a");
    const valueStoreB = new DSMapStore<VSB>("b");
    const valueStoreAB = new DSMapStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.create(42, { a: 0 });
    const valueB = valueStoreB.create(42, { b: 0 });
    const valueAB = valueStoreAB.create(42, { a: 0, b: 0, cnt: 0 });

    const unlistenA = valueStoreA.listenEvent({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        valueAB.value.a = dsEvent.payload.entity.value.a;
        valueAB.value.cnt = valueAB.value.cnt * 10 + 1;
        var result = new Promise((resolve) => {
            setTimeout(() => { valueAB.valueChanged(); }, 200);
            resolve(undefined);
        });
        return result;
    });
    const unlistenB = valueStoreA.listenEvent({ storeName: "b", event: "value" }, (dsEvent: DSEventValue<VSB>) => {
        valueAB.value.b = dsEvent.payload.entity.value.b;
        valueAB.value.cnt = valueAB.value.cnt * 100 + 2;
        var result = new Promise((resolve) => {
            setTimeout(() => { valueAB.valueChanged(); }, 50);
            resolve(undefined);
        });
        return result;
    });

    await storeManager.process(() => {
        valueA.value = { a: 1 };
        valueB.value = { b: 2 };
    });

    expect(valueAB.value).toStrictEqual({ a: 1, b: 2, cnt: 100 * 1 + 2 });

    unlistenA();
    unlistenB();
});


test('DSMapStore copy', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSMapStore<VSA>("a");
    const valueStoreB = new DSMapStore<VSB>("b");
    const valueStoreAB = new DSMapStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    valueStoreA.listenEvent({ storeName: "a", event: "attach" }, (dsEvent: DSEventAttach<VSA>) => {
        const key = dsEvent.payload.key!;
        const v = valueStoreB.entities.get(key)
        if (v === undefined) {
            valueStoreB.create(key, { b: dsEvent.payload.entity.value.a });
        } else {
            debugger;
            throw "unexpected map 179"
        }
    });

    valueStoreA.listenEvent({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        debugger;
        throw "unexpected map 184"
    })

    const valueA1 = valueStoreA.create(42, { a: 1 });
    expect(valueStoreB.entities.size).toBe(1);

    const valueA2 = valueStoreA.create(21, { a: 2 });

    expect(valueStoreB.entities.size).toBe(2);
});