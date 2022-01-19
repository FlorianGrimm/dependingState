import { dsLog } from ".";
import { DSEventHandlerResult } from "./types";

export function catchLog<T>(msg: string, promise: Promise<T>): Promise<T | void> {
    return promise.then((v) => {
        return v;
    }, (reason: any) => {
        // console.error(msg, reason);
        dsLog.errorACME("DS", "handleDSEventHandlerResult", msg, reason);
        return undefined!;
    });
}
export function handleDSEventHandlerResult(msg: string, p: DSEventHandlerResult): DSEventHandlerResult {
    if (p && (typeof p.then === "function")) {
        return p.then((v) => {
            return v;
        }, (reason: any) => {
            // console.error(msg, reason);
            dsLog.errorACME("DS", "handleDSEventHandlerResult", msg, reason);
            return undefined!;
        });
    }
}