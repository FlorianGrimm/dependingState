import pathToRegexp from "path-to-regexp";

let cache: { [path: string]: pathToRegexp.PathFunction } = {};
const cacheLimit = 100;
let cacheCount = 0;

function compilePath(path: string): pathToRegexp.PathFunction {
    if (cache[path]) {
        return cache[path];
    }

    const generator = pathToRegexp.compile(path);

    // if (cacheCount < cacheLimit) {
    //     cache[path] = generator;
    //     cacheCount++;
    // }

    if (cacheCount > cacheLimit) {
        cacheCount = 0;
        cache={}
    }
    cache[path] = generator;

    return generator;
}

/**
 * Public API for generating a URL pathname from a path and parameters.
 */
export function generatePath(path: string = "/", params = {}) {
    return path === "/" ? path : compilePath(path)(params/*, { pretty: true }*/);
}
