import { RouterLocation } from './types';

/**
 * Adds query to location.
 * Utilises the search prop of location to construct query.
 */
export function injectQuery(location: Location): RouterLocation {
    if (location && typeof (location as any).query !== "undefined") {
        // Don't inject query if it already exists in history
        return location as unknown as RouterLocation;
    }

    const searchQuery = location && location.search

    if (typeof searchQuery !== 'string' || searchQuery.length === 0) {
        return {
            ...location,
            query: {}
        } as unknown as RouterLocation;
    }

    // Ignore the `?` part of the search string e.g. ?username=codejockie
    const search = searchQuery.substring(1)
    // Split the query string on `&` e.g. ?username=codejockie&name=Kennedy
    const queries = search.split('&')
    // Contruct query
    const query = queries.reduce((acc, currentQuery) => {
        // Split on `=`, to get key and value
        const [queryKey, queryValue] = currentQuery.split('=');
        return {
            ...acc,
            [queryKey]: queryValue
        }
    }, {});

    return {
        ...location,
        query
    } as unknown as RouterLocation;
}
