import type { Component } from "react";
import type { DSLogFlag, IDSStoreManager } from "./types";
import type { DSStoreManager } from "./DSStoreManager";

function noop() {
}

function warnIfCalled(...data: any[]) {
    console.warn("warn log was not conditional. please add 'if (dsLog.enabled) { }' ");
    console.trace(data);
}

//
export class DSLogBase<Flag extends string = string> {
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

    group: (...data: any[]) => void;
    groupEnd: () => void;

    debug: (...data: any[]) => void;
    info: (...data: any[]) => void;
    log: (...data: any[]) => void;
    warn: (...data: any[]) => void;
    error: (...data: any[]) => void;

    trace: (...data: any[]) => void;

    enabled: boolean;
    logEnabled: boolean;
    mode: "disabled" | "enabled" | "WarnIfCalled";
    enableTiming: boolean;
    storeManager: IDSStoreManager | undefined;
    flags: Set<Flag>;

    constructor(
        public name: string
    ) {
        this.enabled = false;
        this.logEnabled = false;
        this.enableTiming = false;
        this.mode = "disabled";

        this.group = noop;
        this.groupEnd = noop;

        this.debug = noop;
        this.info = noop;
        this.log = noop;
        this.warn = noop;
        this.error = noop;

        this.trace = noop;
        this.flags = new Set();
    }
    public initialize(mode?: "disabled" | "enabled" | "WarnIfCalled" | "applyFromLocalStorage") {
        // for now
        // dsLog.setSelfInGlobal();
        // dsLog.setMode("enabled");

        if (mode === undefined) {
            this.applyFromLocalStorage();
        } else {
            this.setMode(mode);
        }
        if (this.enabled) {
            dsLog.setSelfInGlobal();
        }
    }
    public attach(storeManager: IDSStoreManager): void {
        this.storeManager = storeManager;

        // TODO: thinkof same as initialize
        if (this.enabled) {
            (storeManager as DSStoreManager).enableTiming = this.enableTiming;
            (storeManager as DSStoreManager).setSelfInGlobal();
        }
    }

    public setDisabled(): this {
        // nop be quiet
        // console.debug(`${this.name} setDisabled`);

        this.enabled = false;
        this.logEnabled = false;
        this.mode = "disabled";

        this.group = noop;
        this.groupEnd = noop;

        this.debug = noop;
        this.info = noop;
        this.log = noop;
        this.warn = noop;
        this.error = noop;

        this.trace = noop;

        return this;
    }

    public setEnabled(): this {
        if (this.mode == "enabled") { return this; }
        console.debug(`${this.name} setEnabled`);
        this.enabled = true;
        this.logEnabled = true;
        this.mode = "enabled";

        this.group = console.group;
        this.groupEnd = console.groupEnd;

        this.debug = console.debug;
        this.info = console.info;
        this.log = console.log;
        this.warn = console.warn;
        this.error = console.error;

        this.trace = console.trace;

        return this;
    }

    public setWarnIfCalled(): this {
        if (this.mode == "WarnIfCalled") { return this; }
        console.debug(`${this.name} setWarnIfCalled`);
        this.enabled = true;
        this.logEnabled = false;
        this.mode = "WarnIfCalled";

        this.group = warnIfCalled;
        this.groupEnd = warnIfCalled;

        this.debug = warnIfCalled;
        this.info = warnIfCalled;
        this.log = warnIfCalled;
        this.warn = warnIfCalled;
        this.error = warnIfCalled;

        this.trace = warnIfCalled;

        return this;
    }

    public setMode(mode: "disabled" | "enabled" | "WarnIfCalled" | "applyFromLocalStorage") {
        if (mode === "enabled") {
            this.setEnabled();
        } else if (mode === "WarnIfCalled") {
            this.setWarnIfCalled();
        } else if (mode === "disabled") {
            this.setDisabled();
        } else {
            console.debug(`${this.name} setMode applyFromLocalStorage`);
            this.applyFromLocalStorage();
        }
    }

    public saveToLocalStorage(key?: string): this {
        const data = {
            mode: this.mode
        };
        window.localStorage.setItem(key || this.name, JSON.stringify(data));

        return this;
    }

    public applyFromLocalStorage(key?: string): this {
        const json = window.localStorage.getItem(key || this.name);
        if (json) {
            const data = JSON.parse(json);
            if (data) {
                if (typeof data.mode === "string") {
                    if (data.mode === "enabled") {
                        this.setEnabled();
                    } else if (data.mode === "WarnIfCalled") {
                        this.setWarnIfCalled();
                    } else {
                        this.setDisabled();
                    }
                }
            }
        }

        return this;
    }

    public isEnabled(flag: Flag): boolean {
        if (this.enabled) {
            if (this.flags.size === 0) {
                return true;
            } else {
                return this.flags.has(flag);
            }
        }
        return false;
    }

}

export function defaultConvertExtraArg(currentExtraArg: any): string {
    if (currentExtraArg === undefined) {
        return "undefined";
    }
    if (currentExtraArg === null) {
        return "null";
    }
    if (typeof currentExtraArg === "string") {
        return currentExtraArg;
    }
    if (currentExtraArg.constructor && typeof currentExtraArg.constructor.name === "string") {
        return currentExtraArg.constructor.name;
    }
    return `${currentExtraArg}`;
}
type fnACME = (
    currentApp: string,
    currentClass: string,
    currentMethod: string,
    currentExtraArg: any,
    message?: string | undefined
) => void;

function templateAMCE(
    this: DSLogACME,
    log: (...data: any[]) => void,
    currentApp: string,
    currentClass: string,
    currentMethod: string,
    currentExtraArg: any, //React.Component
    message: string | undefined = undefined
) {
    let effectiveArg: string = "";
    let calcedEffectiveArg = false;
    if (message === undefined) { message = ""; }
    if (this.amceEnabled) {
        effectiveArg = this.convertArg(currentExtraArg);
        calcedEffectiveArg = true;
        if ((this.watchoutApp === undefined || this.watchoutApp === currentApp)
            && (this.watchoutClass === undefined || this.watchoutClass === currentClass)
            && (this.watchoutMethod === undefined || this.watchoutMethod === currentMethod)
            && (this.watchoutExtraArg === undefined || this.watchoutExtraArg === effectiveArg)) {
            this.watchoutHit++;
            if (dsLog.logEnabled) {
                console.warn(currentApp, currentClass, currentMethod, effectiveArg, this.watchoutHit, message);
            }
            if (this.watchoutStopAt === this.watchoutHit) {
                /*
                    the condition matched. have a look at the call stack.
                */
                debugger;
            }
            return;
        }
    }
    if (dsLog.logEnabled) {
        if (!calcedEffectiveArg) {
            effectiveArg = this.convertArg(currentExtraArg);
            calcedEffectiveArg = true;
        }
        log(currentApp, currentClass, currentMethod, effectiveArg, message);
    }
}

export class DSLogACME<Flag extends string = string> extends DSLogBase<Flag> {
    convertArg: (currentArg: any) => string;
    amceEnabled: boolean;
    watchoutApp: string | undefined;
    watchoutClass: string | undefined;
    watchoutMethod: string | undefined;
    watchoutExtraArg: string | undefined;
    watchoutHit: number;
    watchoutStopAt: number | undefined;

    debugACME: fnACME;
    infoACME: fnACME;
    logACME: fnACME;
    warnACME: fnACME;
    errorACME: fnACME;

    constructor(name: string) {
        super(name);
        this.convertArg = defaultConvertExtraArg;
        this.amceEnabled = false;
        this.watchoutApp = undefined;
        this.watchoutClass = undefined;
        this.watchoutMethod = undefined;
        this.watchoutExtraArg = undefined;
        this.watchoutHit = 0;
        this.watchoutStopAt = undefined;

        this.debugACME = this.debug;
        this.infoACME = this.info;
        this.logACME = this.log;
        this.warnACME = this.warn;
        this.errorACME = this.error;
    }

    public setDisabled(): this {
        super.setDisabled();

        if (this.amceEnabled) {
            this.bindACME();
        } else {
            this.enabled = false;
            this.debugACME = noop;
            this.infoACME = noop;
            this.logACME = noop;
            this.warnACME = noop;
            this.errorACME = noop;
        }
        return this;
    }

    public setEnabled(): this {
        super.setEnabled();
        this.bindACME();
        return this;
    }

    public setWarnIfCalled(): this {
        super.setWarnIfCalled();
        this.bindACME();
        return this;
    }

    public setWatchout(
        watchoutApp: string | undefined = undefined,
        watchoutClass: string | undefined = undefined,
        watchoutMethod: string | undefined = undefined,
        watchoutExtraArg: string | undefined = undefined,
        watchoutStopAt: number | undefined = undefined
    ): this {
        this.watchoutApp = watchoutApp;
        this.watchoutClass = watchoutClass;
        this.watchoutMethod = watchoutMethod;
        this.watchoutExtraArg = watchoutExtraArg;
        this.watchoutStopAt = watchoutStopAt;
        const oldwatchoutEnabled = this.amceEnabled;
        this.amceEnabled = (
            (watchoutApp !== undefined)
            || (watchoutClass !== undefined)
            || (watchoutMethod !== undefined)
            || (watchoutExtraArg !== undefined)
        );
        if (oldwatchoutEnabled != this.amceEnabled) {
            this.bindACME();
        }
        dsLog.info("DS setWatchout", watchoutApp, watchoutClass, watchoutMethod, watchoutExtraArg);
        this.enabled = this.amceEnabled || this.logEnabled;
        return this;
    }
    public bindACME(): void {
        if (this.amceEnabled) {
            this.enabled = true;
            this.infoACME = templateAMCE.bind(this, console.info);
            this.debugACME = templateAMCE.bind(this, console.debug);
            this.logACME = templateAMCE.bind(this, console.log);
            this.warnACME = templateAMCE.bind(this, console.warn);
            this.errorACME = templateAMCE.bind(this, console.error);
        } else {
            this.debugACME = this.debug;
            this.infoACME = this.info;
            this.logACME = this.log;
            this.warnACME = this.warn;
            this.errorACME = this.error;
            this.enabled = this.logEnabled;
        }
    }

    public clearFromLocalStorage(key?: string): this {
        if (!key) { key = this.name; }

        window.localStorage.removeItem(key);

        return this;
    }

    public saveToLocalStorage(key?: string): this {
        const data = (this.amceEnabled) ? {
            mode: this.mode,
            watchoutEnabled: this.amceEnabled,
            watchoutApp: this.watchoutApp,
            watchoutClass: this.watchoutClass,
            watchoutMethod: this.watchoutMethod,
            watchoutExtraArg: this.watchoutExtraArg,
            watchoutStopAt: this.watchoutStopAt
        } : {
            mode: this.mode
        };

        window.localStorage.setItem(key || this.name, JSON.stringify(data));
        console.info(`window.localStorage.setItem('${(key || this.name)}', '${JSON.stringify(data)}');`)

        return this;
    }

    public applyFromLocalStorage(key?: string): this {
        const json = window.localStorage.getItem(key || this.name);
        if (json) {
            const data = JSON.parse(json);
            if (data) {
                if (typeof data.mode === "string") {
                    if (data.mode === "enabled") {
                        this.setEnabled();
                    } else if (data.mode === "WarnIfCalled") {
                        this.setWarnIfCalled();
                    } else {
                        this.setDisabled();
                    }
                }
                if (data.watchoutEnabled === true) {
                    console.info("DS DSLogApp applyFromLocalStorage watchoutEnabled");
                    this.setWatchout(
                        (typeof data.watchoutApp === "string") ? data.watchoutApp : undefined,
                        (typeof data.watchoutClass === "string") ? data.watchoutClass : undefined,
                        (typeof data.watchoutMethod === "string") ? data.watchoutMethod : undefined,
                        (typeof data.watchoutExtraArg === "string") ? data.watchoutExtraArg : undefined,
                        (typeof data.watchoutStopAt === "number") ? data.watchoutStopAt : undefined
                    );
                } else {
                    this.amceEnabled = false;
                    this.enabled = this.logEnabled;
                }
            }
        }
        return this;
    }
}


export class DSLog<Flag extends string = string> extends DSLogACME<Flag> {
    constructor(name: string) {
        super(name || "dsLog");
    }
    setSelfInGlobal() {
        if (typeof window !== "undefined") {
            (window as any).dsLog = this;
        }
    }
}

export const dsLog = new DSLog<DSLogFlag>("dsLog");
