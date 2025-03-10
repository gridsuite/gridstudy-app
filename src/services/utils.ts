/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { catchErrorHandler, fetchStudyMetadata, StudyMetadata } from '@gridsuite/commons-ui';
import { getUserToken } from '../redux/user-store';

export const FetchStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};
type ErrorType = Error & {
    status?: number;
};
type DefaultParameters = StudyMetadata['defaultParametersValues'];
export const getWsBase = () => document.baseURI.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');

export const getRequestParamFromList = (params: any[], paramName: string) => {
    return new URLSearchParams(params?.length ? params.map((param) => [paramName, param]) : []);
};

const parseError = (text: string) => {
    try {
        return JSON.parse(text);
    } catch (err) {
        return null;
    }
};

const handleError = (response: Response) => {
    return response.text().then((text) => {
        const errorName = 'HttpResponseError : ';
        let error: ErrorType;
        const errorJson = parseError(text);
        if (errorJson?.status && errorJson.error && errorJson.message) {
            error = new Error(
                errorName + errorJson.status + ' ' + errorJson.error + ', message : ' + errorJson.message
            );
            error.status = errorJson.status;
        } else {
            error = new Error(errorName + response.status + ' ' + response.statusText + ', message : ' + text);
            error.status = response.status;
        }
        throw error;
    });
};

const prepareRequest = (init: RequestInit | undefined, token: string | undefined) => {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError('Argument 2 of backendFetch is not an object' + typeof init);
    }
    const initCopy = { ...init };
    initCopy.headers = new Headers(initCopy.headers || {});
    const tokenCopy = token ?? getUserToken();
    initCopy.headers.append('Authorization', 'Bearer ' + tokenCopy);
    return initCopy;
};

const safeFetch = (url: string, initCopy: RequestInit) => {
    return fetch(url, initCopy).then((response: any) => (response.ok ? response : handleError(response)));
};

export const backendFetch = (url: string, init?: RequestInit, token?: string) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy);
};

export const backendFetchText = (url: string, init?: RequestInit, token?: string) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) => safeResponse.text());
};

export const backendFetchJson = (url: string, init?: RequestInit, token?: string) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) => (safeResponse.status === 204 ? null : safeResponse.json()));
};

export const backendFetchFile = (url: string, init: RequestInit, token?: string) => {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) => safeResponse.blob());
};

const FILE_TYPE = {
    ZIP: 'ZIP',
};
export const downloadZipFile = (blob: Blob, fileName: string) => {
    downloadFile(blob, fileName, FILE_TYPE.ZIP);
};

const downloadFile = (blob: Blob, filename: string, type: string) => {
    let contentType;
    if (type === FILE_TYPE.ZIP) {
        contentType = 'application/octet-stream';
    }
    //BlobPropertyBag does not contain contentType as attribute
    // @ts-ignore
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
    return fetch('idpSettings.json').then((res) => res.json());
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
    console.info('fetching study default parameters values from apps-metadata file');
    const defaultValues: DefaultParameters = {
        enableDeveloperMode: false,
    };
    return fetchStudyMetadata()
        .then((studyMetadata) => {
            return studyMetadata?.defaultParametersValues ?? defaultValues;
        })
        .catch((error: unknown) => {
            catchErrorHandler(error, (message) => {
                console.error(`fetching error (${message}), then default values will be used.`);
            });
            return defaultValues;
        });
};
export const getQueryParamsList = (params: string[] | number[] | null | undefined, paramName: string) => {
    if (params != null && Array.isArray(params) && params.length > 0) {
        const urlSearchParams = new URLSearchParams();
        params.forEach((id) => urlSearchParams.append(paramName, String(id)));
        return urlSearchParams.toString();
    }
    return '';
};

export function getUrlWithToken(baseUrl: string) {
    if (baseUrl.includes('?')) {
        return baseUrl + '&access_token=' + getUserToken();
    } else {
        return baseUrl + '?access_token=' + getUserToken();
    }
}

export function fetchMapBoxToken() {
    console.info(`Fetching MapBoxToken...`);
    return fetchEnv().then((res) => res.mapBoxToken);
}
