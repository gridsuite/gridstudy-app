/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

export function startNonEvacuatedEnergy(studyUuid, currentNodeUuid) {
    console.info(`Running non evacuated energy analysis on ${studyUuid} and node ${currentNodeUuid} ...`);
    const url = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) + '/non-evacuated-energy/run';

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopNonEvacuatedEnergy(studyUuid, currentNodeUuid) {
    console.info(`Stopping non evacuated energy analysis on ${studyUuid} and node ${currentNodeUuid} ...`);
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid)}/non-evacuated-energy/stop`;
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function fetchNonEvacuatedEnergyStatus(studyUuid, currentNodeUuid, currentRootNetworkUuid) {
    console.info(
        `Fetching non evacuated energy analysis status on ${studyUuid} on root network '${currentRootNetworkUuid}' on root network ${currentRootNetworkUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/non-evacuated-energy/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchNonEvacuatedEnergyResult(studyUuid, currentNodeUuid, currentRootNetworkUuid) {
    console.log(currentRootNetworkUuid,`*****Fetching non evacuated energy analysis result on ${studyUuid} and node ${currentNodeUuid}  ...`);

    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid)}/non-evacuated-energy/result`;
    console.debug(url);
    return backendFetchJson(url);
}

export function getNonEvacuatedEnergyParameters(studyUuid) {
    console.info('get non evacuated energy analysis parameters');
    const url = getStudyUrl(studyUuid) + '/non-evacuated-energy/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function setNonEvacuatedEnergyParameters(studyUuid, newParams) {
    console.info('set non evacuated energy analysis parameters');
    const url = getStudyUrl(studyUuid) + '/non-evacuated-energy/parameters';
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function fetchNonEvacuatedEnergyProvider(studyUuid) {
    console.info('fetch non evacuated energy provider');
    const url = `${getStudyUrl(studyUuid)}/non-evacuated-energy/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultNonEvacuatedEnergyProvider() {
    console.info('fetch default non evacuated energy analysis provider');
    const url = `${PREFIX_STUDY_QUERIES}/v1/non-evacuated-energy-default-provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateNonEvacuatedEnergyProvider(studyUuid, newProvider) {
    console.info('update non evacuated energy provider');
    const url = `${getStudyUrl(studyUuid)}/non-evacuated-energy/provider`;
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newProvider,
    });
}
