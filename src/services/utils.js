/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import { fetchAppsMetadata } from '@gridsuite/commons-ui';

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

export const backendFetchFile = (url, init, token) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) => safeResponse.blob());
};

const FILE_TYPE = {
    ZIP: 'ZIP',
};
export const downloadZipFile = (blob, fileName) => {
    downloadFile(blob, fileName, FILE_TYPE.ZIP);
};

const downloadFile = (blob, filename, type) => {
    let contentType;
    if (type === FILE_TYPE.ZIP) {
        contentType = 'application/octet-stream';
    }
    const href = window.URL.createObjectURL(new Blob([blob], { contentType }));
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function fetchEnv() {
    return fetch('env.json').then((res) => res.json());
}

export function fetchIdpSettings() {
    return fetch('idpSettings.json');
}

export function fetchAuthorizationCodeFlowFeatureFlag() {
    console.info(`Fetching authorization code flow feature flag...`);
    return fetchEnv()
        .then((env) =>
            fetch(env.appsMetadataServerUrl + '/authentication.json')
        )
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
        })
        .catch((error) => {
            console.error(error);
            console.warn(
                `Something wrong happened when retrieving authentication.json: authorization code flow will be disabled`
            );
            return false;
        });
}

export function fetchVersion() {
    console.info(`Fetching global metadata...`);
    return fetchEnv()
        .then((env) => fetch(env.appsMetadataServerUrl + '/version.json'))
        .then((response) => response.json())
        .catch((reason) => {
            console.error('Error while fetching the version : ' + reason);
            return reason;
        });
}

export const fetchDefaultParametersValues = () => {
    return fetchAppsMetadata().then((res) => {
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
    if (params !== undefined && params?.length > 0) {
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
    return fetchEnv().then((res) => res.mapBoxToken);
}
