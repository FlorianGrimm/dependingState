export function dsIsArrayEqual<T>(
    arrOld: T[],
    arrNew: T[],
    fnIsEqual: (o: T, n: T) => boolean
): boolean {
    if (arrOld.length !== arrNew.length) {
        return false;
    }
    for (let idx = 0; idx < arrNew.length; idx++) {
        if (!fnIsEqual(arrOld[idx], arrNew[idx])) {
            return false;
        }
    }
    return true;

}