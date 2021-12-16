import {
    deepEquals,
    StateRoot,
    testAndSet,
    testAndSetProp
} from '../index';

type TAppState1 = {
    a: TAppState1A,
    b: TAppState1B,
    c: TAppState1C,
    d: TAppState1D,
}

type TAppState1A = {
    a1: number;
    a2: number;
    stateVersion: number;
}
type TAppState1B = {
    b1: number;
    b2: number;
    stateVersion: number;
}
type TAppState1C = {
    c: number;
    stateVersion: number;
}
type TAppState1D = {
    dMsg: string;
    stateVersion: number;
}
class AppState1 extends StateRoot<TAppState1>{
    constructor(initalState?: TAppState1) {
        super(initalState);
    }
}

test('AppState1 immutable', () => {
    const appState1 = new AppState1({
        a: { a1: 1, a2: 2, stateVersion: 0 },
        b: { b1: 3, b2: 4, stateVersion: 0 },
        c: { c: 0, stateVersion: 0 },
        d: { dMsg: "", stateVersion: 0 }
    });
    appState1.addTransformation("t1", ["a", "b"], ["c"], (stateTransformator, state) => {
        const { a, b } = state;
        const result: TAppState1C = {
            c: a.a1 + a.a2 + b.b1 + b.b2,
            stateVersion: 0
        };
        stateTransformator.setResult("c", result);
    });
    appState1.addTransformation("t1", ["a", "c"], ["d"], (stateTransformator, state) => {
        const { a, c } = state;
        const result: TAppState1D = {
            dMsg: `a1:${a.a1}; a2:${a.a2}; c:${c.c};`,
            stateVersion: 0
        };
        stateTransformator.setResult("d", result);
    });
    //appState1.buildTransformatorOrder();
    appState1.process();
    expect(appState1.states.c.c).toBe(1 + 2 + 3 + 4);
    expect(appState1.states.d.dMsg).toBe("a1:1; a2:2; c:10;");
    expect(appState1.getProcessState("a").stateVersion).toBe(1);
    expect(appState1.getProcessState("b").stateVersion).toBe(1);
    expect(appState1.getProcessState("c").stateVersion).toBe(2);
    expect(appState1.getProcessState("d").stateVersion).toBe(2);

    appState1.setStateFromAction("a", { a1: 5, a2: 2, stateVersion: 0 });
    appState1.process();
    expect(appState1.states.c.c).toBe(5 + 2 + 3 + 4);
    expect(appState1.states.d.dMsg).toBe("a1:5; a2:2; c:14;");
    expect(appState1.getProcessState("a").stateVersion).toBe(3);
    expect(appState1.getProcessState("b").stateVersion).toBe(1);
    expect(appState1.getProcessState("c").stateVersion).toBe(3);
    expect(appState1.getProcessState("d").stateVersion).toBe(3);

    appState1.setStateFromAction("b", { b1: 6, b2: 7, stateVersion: 0 });
    appState1.process();
    expect(appState1.states.c.c).toBe(5 + 2 + 6 + 7);
    expect(appState1.states.d.dMsg).toBe("a1:5; a2:2; c:20;");
    expect(appState1.getProcessState("a").stateVersion).toBe(3);
    expect(appState1.getProcessState("b").stateVersion).toBe(4);
    expect(appState1.getProcessState("c").stateVersion).toBe(4);
    expect(appState1.getProcessState("d").stateVersion).toBe(4);

});


test('AppState1 mutable', () => {
    const appState1 = new AppState1({
        a: { a1: 1, a2: 2, stateVersion: 0 },
        b: { b1: 3, b2: 4, stateVersion: 0 },
        c: { c: 0, stateVersion: 0 },
        d: { dMsg: "", stateVersion: 0 }
    });
    appState1.addTransformation("t1", ["a", "b"], ["c"], (stateTransformator, state) => {
        const { a, b, c } = state;
        // c.c = a.a1 + a.a2 + b.b1 + b.b2;
        let hasChanged = false;
        hasChanged = testAndSet(a.a1 + a.a2 + b.b1 + b.b2, c.c, (v) => c.c = v, hasChanged);
        stateTransformator.setHasChanged("c", hasChanged);
    });
    appState1.addTransformation("t1", ["a", "c"], ["d"], (stateTransformator, state) => {
        const { a, c, d } = state;
        let hasChanged = false;
        hasChanged = testAndSetProp(d, "dMsg", `a1:${a.a1}; a2:${a.a2}; c:${c.c};`, hasChanged);
        stateTransformator.setHasChanged("d", hasChanged)
    });
    //appState1.buildTransformatorOrder();
    appState1.process();
    expect(appState1.states.c.c).toBe(1 + 2 + 3 + 4);
    expect(appState1.states.d.dMsg).toBe("a1:1; a2:2; c:10;");
    expect(appState1.getProcessState("a").stateVersion).toBe(1);
    expect(appState1.getProcessState("b").stateVersion).toBe(1);
    expect(appState1.getProcessState("c").stateVersion).toBe(2);
    expect(appState1.getProcessState("d").stateVersion).toBe(2);

    appState1.setStateFromAction("a", { a1: 5, a2: 2, stateVersion: 0 });
    appState1.process();
    expect(appState1.states.c.c).toBe(5 + 2 + 3 + 4);
    expect(appState1.states.d.dMsg).toBe("a1:5; a2:2; c:14;");
    expect(appState1.getProcessState("a").stateVersion).toBe(3);
    expect(appState1.getProcessState("b").stateVersion).toBe(1);
    expect(appState1.getProcessState("c").stateVersion).toBe(3);
    expect(appState1.getProcessState("d").stateVersion).toBe(3);

    appState1.setStateFromAction("b", { b1: 6, b2: 7, stateVersion: 0 });
    appState1.process();
    expect(appState1.states.c.c).toBe(5 + 2 + 6 + 7);
    expect(appState1.states.d.dMsg).toBe("a1:5; a2:2; c:20;");
    expect(appState1.getProcessState("a").stateVersion).toBe(3);
    expect(appState1.getProcessState("b").stateVersion).toBe(4);
    expect(appState1.getProcessState("c").stateVersion).toBe(4);
    expect(appState1.getProcessState("d").stateVersion).toBe(4);

    appState1.setStateFromAction("b", { b1: 6, b2: 7, stateVersion: 0 });
    appState1.process();
    expect(appState1.states.c.c).toBe(5 + 2 + 6 + 7);
    expect(appState1.states.d.dMsg).toBe("a1:5; a2:2; c:20;");
    expect(appState1.getProcessState("a").stateVersion).toBe(3);
    expect(appState1.getProcessState("b").stateVersion).toBe(5);
    expect(appState1.getProcessState("c").stateVersion).toBe(4);
    expect(appState1.getProcessState("d").stateVersion).toBe(4);
});

test('AppState1 action', () => {
    const appState1 = new AppState1({
        a: { a1: 1, a2: 2, stateVersion: 0 },
        b: { b1: 3, b2: 4, stateVersion: 0 },
        c: { c: 0, stateVersion: 0 },
        d: { dMsg: "", stateVersion: 0 }
    });
    appState1.addTransformation("t1", ["a", "b"], ["c"], (stateTransformator, state) => {
        const { a, b, c } = state;
        // c.c = a.a1 + a.a2 + b.b1 + b.b2;
        let hasChanged = false;
        hasChanged = testAndSet(a.a1 + a.a2 + b.b1 + b.b2, c.c, (v) => c.c = v, hasChanged);
        stateTransformator.setHasChanged("c", hasChanged);
    });
    appState1.addTransformation("t1", ["a", "c"], ["d"], (stateTransformator, state) => {
        const { a, c, d } = state;
        let hasChanged = false;
        hasChanged = testAndSetProp(d, "dMsg", `a1:${a.a1}; a2:${a.a2}; c:${c.c};`, hasChanged);
        stateTransformator.setHasChanged("d", hasChanged)
    });
    const gna = appState1.addAction("gna", (payload: number, stateRoot) => {
        const { a } = stateRoot.states;
        let hasChanged = testAndSetProp(a, "a1", a.a1 + payload, false);
        stateRoot.setStateHasChanged("a", hasChanged);
    });
    //appState1.buildTransformatorOrder();
    appState1.process();
    expect(appState1.states.c.c).toBe(1 + 2 + 3 + 4);
    expect(appState1.states.d.dMsg).toBe("a1:1; a2:2; c:10;");
    gna(100);

    expect(appState1.states.c.c).toBe(1 + 2 + 3 + 4 + 100);
    expect(appState1.states.d.dMsg).toBe("a1:101; a2:2; c:110;");
});


test('AppState1 action 2', () => {
    const appState1 = new AppState1({
        a: { a1: 1, a2: 2, stateVersion: 0 },
        b: { b1: 3, b2: 4, stateVersion: 0 },
        c: { c: 0, stateVersion: 0 },
        d: { dMsg: "", stateVersion: 0 }
    });
    appState1.addTransformation("t1", ["a", "b"], ["c"], (stateTransformator, state) => {
        const { a, b, c } = state;
        // c.c = a.a1 + a.a2 + b.b1 + b.b2;
        let hasChanged = false;
        hasChanged = testAndSet(a.a1 + a.a2 + b.b1 + b.b2, c.c, (v) => c.c = v, hasChanged);
        stateTransformator.setHasChanged("c", hasChanged);
    });
    appState1.addTransformation("t1", ["a", "c"], ["d"], (stateTransformator, state) => {
        const { a, c, d } = state;
        let hasChanged = false;
        hasChanged = testAndSetProp(d, "dMsg", `a1:${a.a1}; a2:${a.a2}; c:${c.c};`, hasChanged);
        stateTransformator.setHasChanged("d", hasChanged)
    });
    const gna1 = appState1.addAction("gna1", (payload: number, stateRoot) => {
        const { a } = stateRoot.states;
        let hasChanged = testAndSetProp(a, "a1", a.a1 + payload, false);
        stateRoot.setStateHasChanged("a", hasChanged);        
    });
    const gna2 = appState1.addAction("gna2", (payload: number, stateRoot) => {
        const { a } = stateRoot.states;
        let hasChanged = testAndSetProp(a, "a1", a.a1 + payload, false);
        stateRoot.setStateHasChanged("a", hasChanged);
        gna1(payload);
    });
    //appState1.buildTransformatorOrder();
    appState1.process();
    expect(appState1.states.c.c).toBe(1 + 2 + 3 + 4);
    expect(appState1.states.d.dMsg).toBe("a1:1; a2:2; c:10;");
    expect(appState1.getProcessState("d").stateVersion).toBe(2);
    gna2(50);

    expect(appState1.states.c.c).toBe(1 + 2 + 3 + 4 + 100);
    expect(appState1.states.d.dMsg).toBe("a1:101; a2:2; c:110;");
    expect(appState1.getProcessState("d").stateVersion).toBe(3);
});