/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { BaseVoltageConfig, catchErrorHandler, fetchStudyMetadata, StudyMetadata } from '@gridsuite/commons-ui';
import { getUserToken } from '../redux/user-store';

export const FetchStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

export const MAX_INT32: number = 2147483647;

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

export async function fetchBaseVoltagesConfig(): Promise<BaseVoltageConfig[] | undefined> {
    console.info('fetching base voltages configuration from apps-metadata file');
    const studyMetadata = await fetchStudyMetadata();
    return studyMetadata.baseVoltagesCongig;
}

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
