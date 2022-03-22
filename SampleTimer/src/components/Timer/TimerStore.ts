import {
    DSObjectStore,
} from "dependingState";

import { TimerValue } from "./TimerValue";

export class TimerStore extends DSObjectStore<TimerValue, "TimerStore"> {
    constructor() {
        super("TimerStore", new TimerValue());
    }
}
