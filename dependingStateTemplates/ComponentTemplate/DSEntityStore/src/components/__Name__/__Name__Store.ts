import type {
    ConfigurationDSEntityValueStore
} from "dependingState";

import {
    DSEntityStore
} from "dependingState";

import type { IAppStoreManager } from "~/services/AppStoreManager";

import { __Name__Value } from "./__Name__Value";
import { __name__StoreBuilder } from "./__Name__Actions";

function getKey__Name__Value(item: __Name__Value): string {
    return item.id;
}
export class __Name__Store extends DSEntityStore<string, __Name__Value, "__Name__Store"> {
    constructor(
        configuration?: ConfigurationDSEntityValueStore<string, __Name__Value>
    ) {
        configuration = {
            getKey: getKey__Name__Value,
            //emitAttachDetachSetDirty: true,
            ...(configuration || {}) };        
        super("__Name__Store", configuration);
    }

    public initializeStore(): void {
        super.initializeStore();

        this.bindEventAll(__name__StoreBuilder);

        // const appState = (this.storeManager! as unknown as IAppStoreManager).appStore;
        // appState.listenCleanedUpRelated(this.storeName, this);

        // this.stateValue.value.appState = appState.stateValue.value;
        // this.isDirty = true;
    }

    // public processDirty(): boolean {
    //     let result=super.processDirty();
    //     return  result;
    // }

}