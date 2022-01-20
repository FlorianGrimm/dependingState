export class DSValueChanged<T>{
    constructor(
        public next?: ((value: T) => void),
        public value?: T,
        public fnIsEqual?: (o: T, n: T) => boolean) {
    }

    public setValue(value: T): boolean {
        if (this.value === undefined) {
            // changed 
        } else if (this.value === value) {
            // same case T T
            return false;
        } else if (this.fnIsEqual !== undefined) {
            if (this.fnIsEqual(this.value, value)) {
                // equal
                return false;
            }
        }
        this.value = value;
        if (this.next !== undefined) {
            this.next(value);
        }
        return true;
    }
}