import React from "react";
import { DSStoreManager } from ".";

export class DSReactContext<StoreManager extends DSStoreManager>{
    readonly context: React.Context<StoreManager>;

    constructor(
        public storeManager:StoreManager
        ) {
        this.context = React.createContext<StoreManager>(storeManager);
    }
}