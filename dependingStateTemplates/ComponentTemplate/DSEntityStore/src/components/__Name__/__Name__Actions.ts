import { storeBuilder } from "dependingState";

// the import type prevents that webpack add a depenency
import type { __Name__Store } from "./__Name__Store";

export const __name__StoreBuilder = storeBuilder<__Name__Store['storeName']>("__Name__Store");
// export const countDown = __name__StoreBuilder.createAction<undefined, "countDown">("countDown");
// export const countUp = __name__StoreBuilder.createAction<undefined, "countUp">("countUp");

/*
copy this to index.ts - main() - // create all stores

const __name__Store = new __Name__Store();
__name__Store,

copy this to AppStoreManager.ts

import type { __Name__Store } from "~/components/__Name__/__Name__Store";
__name__Store: __Name__Store;
public __name__Store: __Name__Store,
        this.attach(__name__Store);
*/