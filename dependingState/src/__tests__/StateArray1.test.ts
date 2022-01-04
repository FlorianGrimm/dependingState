
import { ActionLevelHandling } from "../ActionLevelHandling";
import { HasChanged } from "../HasChanged";
import { StateArray } from "../StateArray";
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
test('StateArray1', async () => {
    const stateManager = new StateManager();
    const transformationProcessor = stateManager.getTransformationProcessor();
    const stateA1 = new StateArray<StateA>();
    const stateB2 = new StateArray<StateB>();
    /*
    stateB2.setMapTransformation(
        stateA1,
        (srcItem, target, transformationProcessor) => {
            target.setValue(transformationProcessor, { b:srcItem.value.a*2 });
        });
    */
    stateA1.setValue(transformationProcessor, [new StateValue({ a: 1 }), new StateValue({ a: 2 }), new StateValue({ a: 3 })], true);
    await stateB2.execute(transformationProcessor);
    expect(stateB2.value.map(i=>i.value)).toBe([{ b: 2*1 },{ b: 2*2 },{ b: 2*3 }]);
    stateA1.value[2]
});