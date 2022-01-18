import {
    DSStateValueSelf
} from 'dependingState';

import {
    Action as HistoryAction,
    State as HistoryState,
    To as HistoryTo,
    UpdateMode
} from './history';

import { getRouterValueInitial } from './DSRouterStore';

import {
    IDSRouterValue,
    RouterLocation
} from './types';

export class DSRouterValue extends DSStateValueSelf<DSRouterValue> implements IDSRouterValue {
    action: HistoryAction | string;
    location: RouterLocation<HistoryState>;
    updateMode: UpdateMode;

    constructor() {
        super();
        const { action, location, updateMode } = getRouterValueInitial()
        this.action = action;
        this.location = location;
        this.updateMode = updateMode;
    }
}