export class DSLog {
    // assert(condition?: boolean, ...data: any[]): void;
    // clear(): void;
    // count(label?: string): void;
    // countReset(label?: string): void;
    // dir(item?: any, options?: any): void;
    // dirxml(...data: any[]): void;
    // group(...data: any[]): void;
    // groupCollapsed(...data: any[]): void;
    // groupEnd(): void;
    // table(tabularData?: any, properties?: string[]): void;
    // time(label?: string): void;
    // timeEnd(label?: string): void;
    // timeLog(label?: string, ...data: any[]): void;
    // timeStamp(label?: string): void;

    debug:(...data: any[])=> void;
    error:(...data: any[])=> void;
    info:(...data: any[])=> void;
    log:(...data: any[])=> void;
    trace:(...data: any[])=> void;
    warn:(...data: any[])=> void;

    enabled:boolean;
    constructor() {
        this.enabled=false;
        this.debug = console.debug;
        this.error = console.error;
        this.info = console.info;
        this.log = console.log;
        this.trace = console.trace;
        this.warn = console.warn;
    }
}
export const dsLog = new DSLog();