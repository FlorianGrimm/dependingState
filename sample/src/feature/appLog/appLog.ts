import { DSLog, dsLog, DSLogFlag } from "dependingState";

export type AppLogFlag = DSLogFlag;
export const appLog = dsLog as DSLog<AppLogFlag>;