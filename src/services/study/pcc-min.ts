/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';

export function startPccMin(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID): Promise<Response> {
    console.info(
        `Running pcc min on ${studyUuid}  on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) + '/pcc-min/run';

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopPccMin(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping pcc min on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/pcc-min/stop`;
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function fetchPccMinStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching pcc min status on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/pcc-min/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchPccMinResult(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching pcc min result on ${studyUuid} on root network ${currentRootNetworkUuid} and node ${currentNodeUuid}  ...`
    );

    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/pcc-min/result`;
    console.debug(url);
    return backendFetchJson(url);
}
