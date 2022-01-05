import {
    DSValueStore,
    DSStoreManager,
    DSEventValue
} from "../index";
import { DSEventAttach } from "../types";

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

test('DSValueStore process implicit', async () => {
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSValueStore<VSA>("a");
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    let actHit = false;
    let actA = 1;
    const valueA = valueStoreA.create({ a: actA });
    expect(valueA.store).toBe(valueStoreA);

    const unlisten = valueStoreA.listen({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        actHit = true;
        actA = dsEvent.payload.value.a;
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


test('DSValueStore process explicit', async () => {
    const storeManager = new DSStoreManager();
    const valueStoreA = new DSValueStore<VSA>("a");
    storeManager.attach(valueStoreA);
    expect(valueStoreA.storeManager).toBe(storeManager);

    let actHit = false;
    let actA = 1;
    const valueA = valueStoreA.create({ a: actA });
    expect(valueA.store).toBe(valueStoreA);

    //const valueB = valueStoreA.create({ a: 2 });
    const unlisten = valueStoreA.listen({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        actHit = true;
        actA = dsEvent.payload.value.a;
    });

    storeManager.process(() => {
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


test('DSValueStore listen', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSValueStore<VSA>("a");
    const valueStoreB = new DSValueStore<VSB>("b");
    const valueStoreAB = new DSValueStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.create({ a: 0 });
    const valueB = valueStoreB.create({ b: 0 });
    const valueAB = valueStoreAB.create({ a: 0, b: 0, cnt: 0 });

    const unlistenA = valueStoreA.listen({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        valueAB.value.a = dsEvent.payload.value.a;
        valueAB.value.cnt++;
        valueAB.valueChanged();
    });
    const unlistenB = valueStoreA.listen({ storeName: "b", event: "value" }, (dsEvent: DSEventValue<VSB>) => {
        valueAB.value.b = dsEvent.payload.value.b;
        valueAB.value.cnt++;
        valueAB.valueChanged();
    });

    valueA.value = { a: 1 };
    valueB.value = { b: 2 };

    expect(valueAB.value).toStrictEqual({ a: 1, b: 2, cnt: 2 });

    unlistenA();
    unlistenB();
});


test('DSValueStore process promise', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSValueStore<VSA>("a");
    const valueStoreB = new DSValueStore<VSB>("b");
    const valueStoreAB = new DSValueStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    const valueA = valueStoreA.create({ a: 0 });
    const valueB = valueStoreB.create({ b: 0 });
    const valueAB = valueStoreAB.create({ a: 0, b: 0, cnt: 0 });

    const unlistenA = valueStoreA.listen({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        valueAB.value.a = dsEvent.payload.value.a;
        valueAB.value.cnt = valueAB.value.cnt * 10 + 1;
        var result = new Promise((resolve) => {
            setTimeout(() => { valueAB.valueChanged(); }, 200);
            resolve(undefined);
        });
        return result;
    });
    const unlistenB = valueStoreA.listen({ storeName: "b", event: "value" }, (dsEvent: DSEventValue<VSB>) => {
        valueAB.value.b = dsEvent.payload.value.b;
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


test('DSValueStore array', async () => {
    const storeManager = new DSStoreManager();

    const valueStoreA = new DSValueStore<VSA>("a");
    const valueStoreB = new DSValueStore<VSB>("b");
    const valueStoreAB = new DSValueStore<VSAB>("ab");
    storeManager.attach(valueStoreA).attach(valueStoreB).attach(valueStoreAB);

    // const valueB = valueStoreB.create({ b: 0 });
    // const valueAB = valueStoreAB.create({ a: 0, b: 0, cnt: 0 });

    valueStoreA.listen({ storeName: "a", event: "attach" }, (dsEvent: DSEventAttach<VSA>) => {
        const idxB = valueStoreB.entities.findIndex((b)=>b.value.b===dsEvent.payload.value.a);
        if(idxB<0){
            valueStoreB.create({b:dsEvent.payload.value.a});
        } else {
            // valueStoreB.entities[idxB].value.b=dsEvent.payload.value.a
        }
    });

    valueStoreA.listen({ storeName: "a", event: "value" }, (dsEvent: DSEventValue<VSA>) => {
        const idxB = valueStoreB.entities.findIndex((b)=>b.value.b===dsEvent.payload.value.a);
        if(idxB<0){
            // valueStoreB.entities.push(valueStoreB.create({b:dsEvent.payload.value.a}));
        } else {
            valueStoreB.entities[idxB].value.b=dsEvent.payload.value.a
        }
    })

    const valueA1 = valueStoreA.create({ a: 1 });
    console.log(valueStoreB.entities)
    expect(valueStoreB.entities.length).toBe(1);

    const valueA2 = valueStoreA.create({ a: 2 });
    console.log(valueStoreB.entities)

    //expect(valueStoreB.entities.length).toBe(2);
    

});