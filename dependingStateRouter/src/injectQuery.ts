import {
    // Action as HistoryAction,
    Location as HistoryLocation,
    State as HistoryState,
    // History,
    // UpdateMode,
    // To as HistoryTo,
    // Update as HistoryUpdate
} from './history';

import { RouterLocation } from './types';

/**
 * Adds query to location.
 * Utilises the search prop of location to construct query.
 */
export function injectQuery<LocationStateState extends HistoryState = HistoryState>(location: HistoryLocation<LocationStateState>): RouterLocation<HistoryState> {
    if (location && typeof (location as RouterLocation<HistoryState>).query !== "undefined") {
        // Don't inject query if it already exists in history
        return location as RouterLocation<HistoryState>;
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
