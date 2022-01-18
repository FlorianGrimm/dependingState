import {
    DSStateValueSelf
} from 'dependingState';
import { HistoryAction, HistoryState, To, UpdateMode } from '.';

import { IDSRouterValue, RouterLocation } from './types';

export class DSRouterValue extends DSStateValueSelf<DSRouterValue> implements IDSRouterValue {
    action: HistoryAction | string;
    location: RouterLocation<HistoryState>;
    updateMode: UpdateMode;
    
    constructor() {
        super();
        this.action = "";
        this.location = {
            pathname: "",
            search: "",
            hash: "",
            query: {},
            key: "",
            state: undefined
        };
        this.updateMode = UpdateMode.Initialization;
    }
}