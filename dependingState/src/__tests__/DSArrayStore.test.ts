import {
    DSArrayStore,
    DSStoreManager,
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

test('DSArrayStore process implicit', async () => {
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSArrayStore<VSA>("a");
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    let actHit = false;
    let actA = 1;
    const valueA = valueStoreA.create({ a: actA });
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


test('DSArrayStore process explicit', async () => {
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSArrayStore<VSA>("a");
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    let actHit = false;
    let actA = 1;
    const valueA = valueStoreA.create({ a: actA });
    expect(valueA.store).toBe(valueStoreA);

    //const valueB = valueStoreA.create({ a: 2 });
    const unlisten = valueStoreA.listenEventValue("test", (dsEvent) => {
        actHit = true;
        actA = dsEvent.payload.entity!.value.a;
    });

    storeManager.process("test", () => {
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


test('DSArrayStore listen', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSArrayStore<VSA>("a");
    const valueStoreB = new DSArrayStore<VSB>("b");
    const valueStoreAB = new DSArrayStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.create({ a: 0 });
    const valueB = valueStoreB.create({ b: 0 });
    const valueAB = valueStoreAB.create({ a: 0, b: 0, cnt: 0 });

    const unlistenA = valueStoreA.listenEventValue("test", (dsEvent) => {
        valueAB.value.a = dsEvent.payload.entity!.value.a;
        valueAB.value.cnt++;
        valueAB.valueChanged();
    });
    const unlistenB = valueStoreB.listenEventValue("test", (dsEvent) => {
        valueAB.value.b = dsEvent.payload.entity!.value.b;
        valueAB.value.cnt++;
        valueAB.valueChanged();
    });

    valueA.value = { a: 1 };
    valueB.value = { b: 2 };

    expect(valueAB.value).toStrictEqual({ a: 1, b: 2, cnt: 2 });

    unlistenA();
    unlistenB();
});


test('DSArrayStore process promise', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSArrayStore<VSA>("a");
    const valueStoreB = new DSArrayStore<VSB>("b");
    const valueStoreAB = new DSArrayStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.create({ a: 0 });
    const valueB = valueStoreB.create({ b: 0 });
    const valueAB = valueStoreAB.create({ a: 0, b: 0, cnt: 0 });

    const unlistenA = valueStoreA.listenEventValue("test", (dsEvent) => {
        valueAB.value.a = dsEvent.payload.entity!.value.a;
        valueAB.value.cnt = valueAB.value.cnt * 10 + 1;
        var result = new Promise((resolve) => {
            setTimeout(() => { valueAB.valueChanged(); }, 200);
            resolve(undefined);
        });
        return result;
    });
    const unlistenB = valueStoreB.listenEventValue("test", (dsEvent) => {
        valueAB.value.b = dsEvent.payload.entity!.value.b;
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


test('DSArrayStore array', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSArrayStore<VSA>("a");
    const valueStoreB = new DSArrayStore<VSB>("b");
    const valueStoreAB = new DSArrayStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    valueStoreA.listenEventAttach("test", (dsEvent) => {
        const idxB = valueStoreB.entities.findIndex((b) => b.value.b === dsEvent.payload.entity.value.a);
        if (idxB < 0) {
            valueStoreB.create({ b: dsEvent.payload.entity.value.a });
        } else {
            debugger;
            throw "unexpected array 179"
        }
    });

    valueStoreA.listenEventValue("test", (dsEvent) => {
        debugger;
        throw "unexpected array 184"
    })

    const valueA1 = valueStoreA.create({ a: 1 });
    expect(valueStoreB.entities.length).toBe(1);

    const valueA2 = valueStoreA.create({ a: 2 });

    expect(valueStoreB.entities.length).toBe(2);
});