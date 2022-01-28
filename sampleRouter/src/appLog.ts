import { dsLog } from "dependingState";
import type { DSLog, DSLogFlag } from "dependingState";

export type AppLogFlag = DSLogFlag
    | "abc";

export const appLog = dsLog as DSLog<AppLogFlag>