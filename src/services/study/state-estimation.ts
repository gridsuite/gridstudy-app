/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { UUID } from 'crypto';
import { StateEstimationParameters } from '../../components/dialogs/parameters/state-estimation/state-estimation-parameters-utils';

export function startStateEstimation(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Running state estimation on ${studyUuid}  on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/state-estimation/run';

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopStateEstimation(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping state estimation on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/state-estimation/stop`;
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function fetchStateEstimationStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching state estimation status on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/state-estimation/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchStateEstimationResult(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching state estimation result on ${studyUuid} on root network ${currentRootNetworkUuid} and node ${currentNodeUuid}  ...`
    );

    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/state-estimation/result`;
    console.debug(url);
    return backendFetchJson(url);
}

export function updateStateEstimationParameters(studyUuid: UUID | null, newParams: StateEstimationParameters | null) {
    console.info('set state estimation parameters');
    const url = getStudyUrl(studyUuid) + '/state-estimation/parameters';
    console.debug(url);

    console.info('newParams in rest API', newParams);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function getStateEstimationStudyParameters(studyUuid: UUID) {
    console.info('get state estimation study parameters');
    const getStateEstimParams = getStudyUrl(studyUuid) + '/state-estimation/parameters';
    console.debug(getStateEstimParams);
    return backendFetchJson(getStateEstimParams);
}
