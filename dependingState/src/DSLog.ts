import { Component } from "react";

function noop() {
}
function warnIfCalled(...data: any[]) {
    console.warn("warn log not conditional");
    console.trace(data);
}
//
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

    group: (...data: any[]) => void;
    groupEnd: () => void;

    debug: (...data: any[]) => void;
    info: (...data: any[]) => void;
    log: (...data: any[]) => void;
    warn: (...data: any[]) => void;
    error: (...data: any[]) => void;

    trace: (...data: any[]) => void;

    enabled: boolean;
    mode: "disabled" | "enabled" | "WarnIfCalled";

    constructor() {
        this.enabled = false;
        this.mode = "disabled";

        this.group = noop;
        this.groupEnd = noop;

        this.debug = noop;
        this.info = noop;
        this.log = noop;
        this.warn = noop;
        this.error = noop;

        this.trace = noop;
    }

    public setDisabled(): this {
        this.enabled = false;
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
        console.info("DS DSLog setEnabled");
        this.enabled = true;
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
        console.info("DS DSLog setWarnIfCalled");
        this.enabled = false;
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

    public saveToLocalStorage(key?: string): this {
        const data = {
            mode: this.mode
        };
        window.localStorage.setItem(key || "DSLog", JSON.stringify(data));

        return this;
    }

    public applyFromLocalStorage(key?: string): this {
        const json = window.localStorage.getItem(key || "DSLog");
        if (json) {
            const data = JSON.parse(json);
            if (data) {
                if (typeof data.mode === "string") {
                    if (data.mode === "disabled") {
                        this.setDisabled();
                    }
                    if (data.mode === "enabled") {
                        this.setEnabled();
                    }
                    if (data.mode === "WarnIfCalled") {
                        this.setWarnIfCalled();
                    }
                }
            }
        }

        return this;
    }
}

function defaultConvertArg(currentArg: any): string {
    if (currentArg === undefined) {
        return "undefined";
    }
    if (currentArg === null) {
        return "null";
    }
    if (typeof currentArg === "string") {
        return currentArg;
    }
    if (currentArg.constructor && typeof currentArg.constructor.name === "string") {
        return currentArg.constructor.name;
    }
    return `${currentArg}`;
}
type fnACME = (
    currentApp: string,
    currentClass: string,
    currentMethod: string,
    currentExtraArg: any,
    message?: string | undefined
) => void;

function templateAMCE(
    this: DSLogApp,
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
    if (this.watchoutEnabled) {
        effectiveArg = this.convertArg(currentExtraArg);
        calcedEffectiveArg = true;
        if ((this.watchoutApp === undefined || this.watchoutApp === currentApp)
            && (this.watchoutClass === undefined || this.watchoutClass === currentClass)
            && (this.watchoutMethod === undefined || this.watchoutMethod === currentMethod)
            && (this.watchoutExtraArg === undefined || this.watchoutExtraArg === effectiveArg)) {
            this.watchoutHit++;
            if (dsLog.enabled) {
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
    if (dsLog.enabled) {
        if (!calcedEffectiveArg) {
            effectiveArg = this.convertArg(currentExtraArg);
            calcedEffectiveArg = true;
        }
        log(currentApp, currentClass, currentMethod, effectiveArg, message);
    }
}

export class DSLogApp extends DSLog {
    convertArg: (currentArg: any) => string;
    watchoutEnabled: boolean;
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

    constructor() {
        super();
        this.convertArg = defaultConvertArg;
        this.watchoutEnabled = false;
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
        this.bindACME();
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
        const oldwatchoutEnabled = this.watchoutEnabled;
        this.watchoutEnabled = (
            (watchoutApp !== undefined)
            || (watchoutClass !== undefined)
            || (watchoutMethod !== undefined)
            || (watchoutExtraArg !== undefined)
        );
        if (oldwatchoutEnabled != this.watchoutEnabled) {
            this.bindACME();
        }
        dsLog.info("DS setWatchout", watchoutApp, watchoutClass, watchoutMethod, watchoutExtraArg);

        return this;
    }
    public bindACME(): void {
        if (this.watchoutEnabled) {
            this.enabled = true;
            this.infoACME = templateAMCE.bind(this, console.log);
            this.debugACME = templateAMCE.bind(this, console.debug);
            this.infoACME = templateAMCE.bind(this, console.info);
            this.logACME = templateAMCE.bind(this, console.log);
            this.warnACME = templateAMCE.bind(this, console.warn);
            this.errorACME = templateAMCE.bind(this, console.error);
        } else {
            this.debugACME = this.debug;
            this.infoACME = this.info;
            this.logACME = this.log;
            this.warnACME = this.warn;
            this.errorACME = this.error;
        }
    }

    public clearFromLocalStorage(key?: string): this {
        if (!key) { key = "DSLog"; }
        window.localStorage.removeItem(key);

        return this;
    }

    public saveToLocalStorage(key?: string): this {
        const data = {
            mode: this.mode,
            watchoutEnabled: this.watchoutEnabled,
            watchoutApp: this.watchoutApp,
            watchoutClass: this.watchoutClass,
            watchoutMethod: this.watchoutMethod,
            watchoutExtraArg: this.watchoutExtraArg,
            watchoutStopAt: this.watchoutStopAt
        };
        window.localStorage.setItem(key || "DSLog", JSON.stringify(data));
        return this;
    }

    public applyFromLocalStorage(key?: string): this {
        const json = window.localStorage.getItem(key || "DSLog");
        if (json) {
            const data = JSON.parse(json);
            if (data) {
                if (typeof data.mode === "string") {
                    if (data.mode === "disabled") {
                        this.setDisabled();
                    }
                    if (data.mode === "enabled") {
                        this.setEnabled();
                    }
                    if (data.mode === "WarnIfCalled") {
                        this.setWarnIfCalled();
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
                    this.watchoutEnabled = false;
                }
            }
        }
        return this;
    }

    setAppStoreManagerInWindow() {
        (window as any).dsLog = this;
    }
}
export const dsLog = new DSLogApp();
