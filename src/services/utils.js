/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    fetchEnv,
    fetchStudyMetadata,
    getUserToken,
} from '@gridsuite/commons-ui';

export const FetchStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

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
    return fetchStudyMetadata().then((studyMetadata) => {
        console.info(
            'fecthing default parameters values from apps-metadata file'
        );
        return studyMetadata.defaultParametersValues;
    });
};

export function getUrlWithToken(baseUrl) {
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
