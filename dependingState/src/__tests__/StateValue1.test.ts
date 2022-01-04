import { ActionLevelHandling } from "../ActionLevelHandling";
import { HasChanged } from "../HasChanged";
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
test('StateValue1', async () => {
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
        target.setValue(transformationProcessor, { b: a1.value.a + a2.value.a });
    }
    stateB3.setTransformation<{ a1: IStateValue<StateA>, a2: IStateValue<StateA> }>({
        a1: stateA1,
        a2: stateA2,
    }, calcB1);
    stateA1.setValue(transformationProcessor, { a: 1 }, true);
    stateA2.setValue(transformationProcessor, { a: 2 }, true);

    await stateB3.execute(transformationProcessor);

    expect(stateB3.isDirty).toBe(false);

    const stateC4 = new StateValue<StateC>({ c: 0 });
    stateC4.setTransformation({
        a1: stateA1,
        b3: stateB3
    }, ({ a1, b3 }, target, transformationProcessor) => {
        target.setValue(transformationProcessor, { c: a1.value.a + b3.value.b });
    });

    expect(stateC4.value.c).toBe(0);
    await stateC4.execute(transformationProcessor);
    expect(stateC4.value.c).toBe(4);

    stateA1.setValue(transformationProcessor, { a: 10 }, true);
    await stateB3.execute(transformationProcessor);
    await stateC4.execute(transformationProcessor);
    expect(stateC4.value.c).toBe(10 + 2 + 10);
    /*
        const arrProj=[12,3,4];
        // StateValue
        const x = ()=>{
            arrProj.mapArray(x=>x*2 )
            // mapDict
            // group
        };
        x();
        arrProj[2].setValue({projetName:"5"});
        arrProj.setValue({x:[1,3,4,5]})
        (t, projects, focus, hover)=>{t, projects, focus, hover}
    */
});