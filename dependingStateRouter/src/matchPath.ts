import {
    TokensToRegexpOptions,
    ParseOptions,
    Key,
    pathToRegexp
} from "path-to-regexp";
import type { RouteProps } from "./types";
import type { match } from "./types";

const cache: {
    [cacheKey: string]: {
        [path: string]: {
            regexp: RegExp,
            keys: Key[]
        }
    }
} = {};

const cacheLimit = 100;

//let cacheCount = 0;

function compilePath(path: string, options: TokensToRegexpOptions & ParseOptions): {
    regexp: RegExp,
    keys: Key[]
} {
    const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
    let pathCache = cache[cacheKey] || (cache[cacheKey] = {});

    if (pathCache[path]) return pathCache[path];

    const keys: Key[] = [];
    const regexp = pathToRegexp(path, keys, options);
    const result = { regexp, keys };

    if (Object.keys(pathCache).length >= cacheLimit) {
        pathCache = (cache[cacheKey] = {});
    }

    // if (cacheCount < cacheLimit) {
    //     pathCache[path] = result;
    //     cacheCount++;
    // }

    pathCache[path] = result;

    return result;
}

/**
 * Public API for matching a URL pathname to a path.
 */
export function matchPath<Params extends { [K in keyof Params]?: string }, Path extends string = string>(
    pathname: string,
    options: RouteProps<Path>
): match<Params> | null {
    if (typeof options === "string" || Array.isArray(options)) {
        options = { path: options };
    }

    const { path, exact = false, strict = false, sensitive = false } = options;

    const paths: string[] = [].concat(path as any);

    const r: ((matched: match<Params> | null, path: string) => match<Params> | null) = (matched: match<Params> | null, path: string) => {
        if (!path && path !== "") return null;
        if (matched) return matched;

        const { regexp, keys } = compilePath(path, {
            end: exact,
            strict,
            sensitive
        });
        const match = regexp.exec(pathname);

        if (!match) return null;

        const [url, ...values] = match;
        const isExact = pathname === url;

        if (exact && !isExact) return null;

        const result: match<Params> = {
            path, // the path used to match
            url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
            isExact, // whether or not we matched exactly
            params: keys.reduce((memo, key, index) => {
                memo[key.name] = values[index];
                return memo;
            }, {} as any) as Params
        };
        return result;
    }
    return paths.reduce(r, null);
}

export default matchPath;
