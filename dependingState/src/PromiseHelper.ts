export function catchLog<T>(msg: string, promise: Promise<T>): Promise<T | void> {
    return promise.then((v) => {
        return v;
    }, (reason) => {
        console.error(msg, reason);
    })
}