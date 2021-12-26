// import { StateRoot } from "dependingState";
import {
    AppRootState,
    getInitalState
} from '../AppRootState';

test('AppState', () => {
    const initalState = getInitalState();
    const appState = new AppRootState(initalState);
});