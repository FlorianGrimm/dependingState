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
    constructor(
        public action: HistoryAction | string,
        public location: RouterLocation<HistoryState>,
        public updateMode: UpdateMode
    ) {
        super();
    }
}
export function getDSRouterValueInitial(){
    const { action, location, updateMode } = getRouterValueInitial()
    const result = new DSRouterValue(action, location, updateMode );
    return result;
}