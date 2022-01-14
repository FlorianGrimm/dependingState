import pathToRegexp from "path-to-regexp";

const cache: { [path: string]: pathToRegexp.PathFunction } = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(path: string): pathToRegexp.PathFunction {
    if (cache[path]) return cache[path];

    const generator = pathToRegexp.compile(path);

    if (cacheCount < cacheLimit) {
        cache[path] = generator;
        cacheCount++;
    }

    return generator;
}

/**
 * Public API for generating a URL pathname from a path and parameters.
 */
export function generatePath(path: string = "/", params = {}) {
    return path === "/" ? path : compilePath(path)(params, { pretty: true });
}
