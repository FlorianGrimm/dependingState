import { DSEventHandlerResult } from "./types";

export function catchLog(msg:string, promise:DSEventHandlerResult) : DSEventHandlerResult{
    if (promise && typeof promise.then === "function"){
        promise.then((v)=>{
            return v;
        },(reason)=>{
            console.error(msg, reason);
        })
    }
}