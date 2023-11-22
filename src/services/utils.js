/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';

export const FetchStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

export const getWsBase = () =>
    document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');

export const getRequestParamFromList = (params, paramName) => {
    return new URLSearchParams(
        params?.length ? params.map((param) => [paramName, param]) : []
    );
};

const parseError = (text) => {
    try {
        return JSON.parse(text);
    } catch (err) {
        return null;
    }
};

const handleError = (response) => {
    return response.text().then((text) => {
        const errorName = 'HttpResponseError : ';
        let error;
        const errorJson = parseError(text);
        if (
            errorJson &&
            errorJson.status &&
            errorJson.error &&
            errorJson.message
        ) {
            error = new Error(
                errorName +
                    errorJson.status +
                    ' ' +
                    errorJson.error +
                    ', message : ' +
                    errorJson.message
            );
            error.status = errorJson.status;
        } else {
            error = new Error(
                errorName +
                    response.status +
                    ' ' +
                    response.statusText +
                    ', message : ' +
                    text
            );
            error.status = response.status;
        }
        throw error;
    });
};

export const getToken = () => {
    const state = store.getState();
    return state.user.id_token;
};

const prepareRequest = (init, token) => {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError(
            'Argument 2 of backendFetch is not an object' + typeof init
        );
    }
    const initCopy = Object.assign({}, init);
    initCopy.headers = new Headers(initCopy.headers || {});
    const tokenCopy = token ? token : getToken();
    initCopy.headers.append('Authorization', 'Bearer ' + tokenCopy);
    return initCopy;
};

const safeFetch = (url, initCopy) => {
    return fetch(url, initCopy).then((response) =>
        response.ok ? response : handleError(response)
    );
};

export const backendFetch = (url, init, token) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy);
};

export const backendFetchText = (url, init, token) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) => safeResponse.text());
};

export const backendFetchJson = (url, init, token) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) =>
        safeResponse.status === 204 ? null : safeResponse.json()
    );
};

export function fetchAuthorizationCodeFlowFeatureFlag() {
    console.info(`Fetching authorization code flow feature flag...`);
    return fetch('env.json')
        .then((res) => res.json())
        .then((res) => {
            console.log(
                `Authorization code flow is ${
                    res.authorizationCodeFlowFeatureFlag
                        ? 'enabled'
                        : 'disabled'
                }`
            );
            return res.authorizationCodeFlowFeatureFlag;
        });
}

export function fetchAppsAndUrls() {
    console.info(`Fetching apps and urls...`);
    return fetch('env.json')
        .then((res) => res.json())
        .then((res) => {
            return fetch(
                res.appsMetadataServerUrl + '/apps-metadata.json'
            ).then((response) => {
                return response.json();
            });
        });
}

export const fetchDefaultParametersValues = () => {
    return fetchAppsAndUrls().then((res) => {
        console.info(
            'fecthing default parameters values from apps-metadata file'
        );
        const studyMetadata = res.find((metadata) => metadata.name === 'Study');
        if (!studyMetadata) {
            return Promise.reject(
                'Study entry could not be found in metadatas'
            );
        }

        return studyMetadata.defaultParametersValues;
    });
};
export const getQueryParamsList = (params, paramName) => {
    if (params !== undefined && params.length > 0) {
        const urlSearchParams = new URLSearchParams();
        params.forEach((id) => urlSearchParams.append(paramName, id));
        return urlSearchParams.toString();
    }
    return '';
};

export function getUrlWithToken(baseUrl) {
    if (baseUrl.includes('?')) {
        return baseUrl + '&access_token=' + getToken();
    } else {
        return baseUrl + '?access_token=' + getToken();
    }
}

export function fetchMapBoxToken() {
    console.info(`Fetching MapBoxToken...`);
    return fetch('env.json')
        .then((res) => res.json())
        .then((res) => {
            return res.mapBoxToken;
        });
}
