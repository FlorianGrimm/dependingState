export type TIncdec = (diff: number) => void;
export class ActionLevelHandling {
    static create(incdec: TIncdec): ActionLevelHandling {
        return (new ActionLevelHandling(incdec)).start();
    }
    incdec: TIncdec;
    added: boolean;
    constructor(incdec: TIncdec) {
        this.incdec = incdec;
        this.added = false;
    }

    start(): this {
        if (this.added) {
            //
        } else {
            this.incdec(+1);
            this.added = true;
        }
        return this;
    }

    stop(): this {
        if (this.added) {
            this.incdec(-1);
            this.added = false;
        } else {
            //
        }
        return this;
    }
}