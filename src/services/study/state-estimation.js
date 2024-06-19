/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

export function startStateEstimation(studyUuid, currentNodeUuid) {
    console.info(
        `Running state estimation on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/state-estimation/run';

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopStateEstimation(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping state estimation on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/state-estimation/stop`;
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function fetchStateEstimationStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching state estimation status on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/state-estimation/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchStateEstimationResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching state estimation result on ${studyUuid} and node ${currentNodeUuid}  ...`
    );

    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/state-estimation/result`;
    console.debug(url);
    return backendFetchJson(url);
}
