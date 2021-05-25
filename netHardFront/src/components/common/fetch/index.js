import LocalStorageWrapper from '../localStorageWrapper';
function commonFetch(url, method, body, headers = {}, abortController) {
    try {
        if (!abortController instanceof AbortController) {
            throw new Error('abortController must be an instance of AbortController');
        }
        return fetch(url, {
            body,
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, same-origin, *omit
            method, // *GET, POST, PUT, DELETE, etc.
            headers: {
                ...headers
            },
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
            signal: abortController && abortController.signal
        });
    } catch (error) {
        throw new Error(error);
    }

}

export function fetchJSONData(url, method, { body, headers } = {}, abortController) {
    return commonFetch(url, method, JSON.stringify(body), { 'content-type': 'application/json', ...headers }, abortController);
}

export function fetchData(url, method, { body, headers } = {}, abortController) {
    return commonFetch(url, method, body, headers, abortController);
}

export function fetchDataWithToken(fetchMethod, url, method, { body, headers, keyRoot } = {}, abortController) {
    if (!keyRoot) throw new Error('need keyRoot for token.');
    return fetchMethod(url, method, {
        body,
        headers: {
            ...headers,
            'x-auth-token': LocalStorageWrapper.instance(keyRoot).pick('token')
        }
    }, abortController);
}