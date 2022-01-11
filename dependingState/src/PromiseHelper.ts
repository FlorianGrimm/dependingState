import { DSEventHandlerResult } from "./types";

export function catchLog<T>(msg: string, promise: Promise<T>): Promise<T | void> {
    //if (promise && typeof promise.then === "function") {
    return promise.then((v) => {
        return v;
    }, (reason) => {
        console.error(msg, reason);
    })
    // }
    // return;
}