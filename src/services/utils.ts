/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { catchErrorHandler, fetchStudyMetadata, IdpSettings, StudyMetadata } from '@gridsuite/commons-ui';
export const FetchStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

export const MAX_INT32: number = 2147483647;
const IDP_SETTINGS_CACHE_KEY = 'gridsuite-idp-settings';
type DefaultParameters = StudyMetadata['defaultParametersValues'];
export const getWsBase = () => document.baseURI.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');

export const getRequestParamFromList = (params: any[], paramName: string) => {
    return new URLSearchParams(params?.length ? params.map((param) => [paramName, param]) : []);
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
    link.click(); // start download
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href); // tell browser we are done with this url
};

function fetchEnv() {
    return fetch('env.json').then((res) => res.json());
}

// Always hits the network: picks up config changes on each full app load
// AND refreshes the cache read by the silent-renew iframe.
export function fetchIdpSettings(): Promise<IdpSettings> {
    return fetch('idpSettings.json')
        .then((res) => res.json())
        .then((settings: IdpSettings) => {
            try {
                localStorage.setItem(IDP_SETTINGS_CACHE_KEY, JSON.stringify(settings));
            } catch (e) {
                console.warn('Failed to cache IdP settings:', e);
            }
            return settings;
        });
}

// Used only on the silent-renew path: reads the cache (no network),
// falls back to a real fetch if the cache is missing/corrupted.
export function getCachedIdpSettings(): Promise<IdpSettings> {
    try {
        const cached = localStorage.getItem(IDP_SETTINGS_CACHE_KEY);
        if (cached) {
            return Promise.resolve(JSON.parse(cached) as IdpSettings);
        }
    } catch (e) {
        // localStorage unavailable, or cache corrupted -> fall back to fresh fetch
        +console.warn('Failed to read cached IdP settings:', e);
    }
    return fetchIdpSettings();
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
        isDeveloperMode: false,
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

export function fetchMapBoxToken() {
    console.info(`Fetching MapBoxToken...`);
    return fetchEnv().then((res) => res.mapBoxToken);
}
