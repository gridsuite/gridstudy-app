/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    cleanLoadFilterNames,
    DynamicMarginCalculationParametersFetchReturn,
    DynamicMarginCalculationParametersInfos,
    enrichLoadFilterNames,
} from '@gridsuite/commons-ui';

export function startDynamicMarginCalculation(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    debug: boolean
): Promise<Response> {
    console.info(
        `Running dynamic margin calculation on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );

    const urlParams = new URLSearchParams();

    if (debug) {
        urlParams.append('debug', `${debug}`);
    }

    const startDynamicMarginCalculationUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/dynamic-margin-calculation/run?${urlParams}`;

    console.debug({ startDynamicMarginCalculationUrl });

    return backendFetch(startDynamicMarginCalculationUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function stopDynamicMarginCalculation(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping dynamic margin calculation  on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );
    const stopDynamicMarginCalculationUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-margin-calculation/stop';
    console.debug(stopDynamicMarginCalculationUrl);
    return backendFetch(stopDynamicMarginCalculationUrl, { method: 'put' });
}

export function fetchDynamicMarginCalculationStatus(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<string | null> {
    console.info(
        `Fetching dynamic margin calculation status on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-margin-calculation/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDynamicMarginCalculationParameters(
    studyUuid: UUID
): Promise<DynamicMarginCalculationParametersFetchReturn> {
    console.info(`Fetching dynamic margin calculation parameters on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-margin-calculation/parameters';
    console.debug(url);
    const parametersPromise: Promise<DynamicMarginCalculationParametersInfos> = backendFetchJson(url);
    return parametersPromise.then(enrichLoadFilterNames);
}

export function fetchDynamicMarginCalculationProvider(studyUuid: UUID) {
    console.info(`Fetching dynamic margin calculation provider on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-margin-calculation/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicMarginCalculationParameters(
    studyUuid: UUID,
    newParams: DynamicMarginCalculationParametersFetchReturn | null
): Promise<Response> {
    console.info(`Setting dynamic margin calculation parameters on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-margin-calculation/parameters';
    console.debug(url);
    const newParameters = newParams !== null ? cleanLoadFilterNames(newParams) : newParams;
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParameters),
    });
}
