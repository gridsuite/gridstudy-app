/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

export function startNonEvacuatedEnergy(studyUuid, currentNodeUuid) {
    console.info(
        `Running sensitivity analysis non evacuated energy on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/sensitivity-analysis-non-evacuated-energy/run';

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopNonEvacuatedEnergy(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping sensitivity analysis non evacuated energy on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis-non-evacuated-energy/stop`;
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function fetchNonEvacuatedEnergyStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching sensitivity analysis non evacuated energy status on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis-non-evacuated-energy/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchNonEvacuatedEnergyResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching sensitivity analysis non evacuated energy result on ${studyUuid} and node ${currentNodeUuid}  ...`
    );

    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis-non-evacuated-energy/result`;
    console.debug(url);
    return backendFetchJson(url);
}

export function getNonEvacuatedEnergyParameters(studyUuid) {
    console.info('get sensitivity analysis non evacuated energy parameters');
    const url =
        getStudyUrl(studyUuid) +
        '/sensitivity-analysis-non-evacuated-energy/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function setNonEvacuatedEnergyParameters(studyUuid, newParams) {
    console.info('set sensitivity analysis non evacuated energy parameters');
    const url =
        getStudyUrl(studyUuid) +
        '/sensitivity-analysis-non-evacuated-energy/parameters';
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
