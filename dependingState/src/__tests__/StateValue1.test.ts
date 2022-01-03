import { StateManager } from "../StateManager";
import { StateValue } from "../StateValue";
import { IStateValue, ITransformationProcessor } from "../types";
import { testAndSet } from "../utility";

type StateA = {
    a: number;
}
type StateB = {
    b: number;
}
type StateC = {
    c: number;
}
test('StateValue1', () => {
    const stateManager = new StateManager();
    const transformationProcessor = stateManager.getTransformationProcessor();
    const stateA1 = new StateValue<StateA>({ a: 0 });
    const stateA2 = new StateValue<StateA>({ a: 0 });
    const liveStateA1 = stateManager.getLiveState(stateA1);
    const liveStateA2 = stateManager.getLiveState(stateA2);
    const stateB3 = new StateValue<StateB>({ b: 0 });
    const liveStateB3 = stateManager.getLiveState(stateB3);
    function calcB1(
        { a1, a2 }: { a1: IStateValue<StateA>, a2: IStateValue<StateA> }, 
        target: IStateValue<StateB>, 
        transformationProcessor: ITransformationProcessor
        ) {
        target.setValue(transformationProcessor, { b: a1.value!.a + a2.value!.a });
    }
    // function calcB2(a1: IStateValue<StateA>, a2: IStateValue<StateA>, b: IStateValue<StateB>) {
    //     let changed = false;
    //     changed = testAndSet(a1.value!.a + a2.value!.a, b.value!.b, (v) => b.value!.b = v, changed);
    //     return changed;
    // }
    // function calcB3(a1: StateA, a2: StateA) {
    //     return { b: a1.a + a2.a };
    // }
    stateB3.setTransformation<{ a1: IStateValue<StateA>, a2: IStateValue<StateA> }>({
        a1: stateA1,
        a2: stateA2,
    }, calcB1);
    stateA1.setValue(transformationProcessor, { a: 1 }, true);
    stateA2.setValue(transformationProcessor, { a: 2 }, true);

    const stateC4 = new StateValue<StateC>({ c: 0 });
    stateC4.setTransformation({
        a1: stateA1,
        b3: stateB3
    }, ({a1,b3}, target, transformationProcessor)=>{
        target.setValue(transformationProcessor, {c:a1.value.a + b3.value.b});
    });

    expect(1).toBe(1);
});