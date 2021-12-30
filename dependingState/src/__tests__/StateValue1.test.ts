import { StateManager } from "../StateManager";
import { StateValue } from "../StateValue";

type StateA = {
    a: number;
}
type StateB = {
    b: number;
}
test('StateValue1', () => {
    const stateManager = new StateManager();
    const stateA1 = new StateValue<StateA>();
    const stateA2 = new StateValue<StateA>();
    stateA1.setValue(stateManager, { a: 1 }, true);
    stateA2.setValue(stateManager, { a: 2 }, true);
    const liveStateA1 = stateManager.getLiveState(stateA1);
    const liveStateA2 = stateManager.getLiveState(stateA2);
    const stateB3 = new StateValue<StateB>();
    const liveStateB3 = stateManager.getLiveState(stateB3);
    function calcB(a1: StateValue<StateA>, a2: StateValue<StateA>) {

    }
    //stateB3.addParameterDependency(stateA1);
    // stateB3.addParameterDependency(stateA2);
    //liveStateB3.addParameterDependency(liveStateA1);
});