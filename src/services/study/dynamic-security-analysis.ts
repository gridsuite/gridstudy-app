/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from './index';

import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import type { UUID } from 'node:crypto';
import {
    DynamicSecurityAnalysisParametersFetchReturn,
    DynamicSecurityAnalysisParametersInfos,
} from './dynamic-security-analysis.type';
import { fetchContingencyAndFiltersLists } from '../directory';

export function startDynamicSecurityAnalysis(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    debug: boolean
): Promise<void> {
    console.info(
        `Running dynamic security analysis on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );

    const urlParams = new URLSearchParams();

    if (debug) {
        urlParams.append('debug', `${debug}`);
    }

    const startDynamicSecurityAnalysisUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/dynamic-security-analysis/run?${urlParams}`;

    console.debug({ startDynamicSecurityAnalysisUrl });

    return backendFetch(startDynamicSecurityAnalysisUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function stopDynamicSecurityAnalysis(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping dynamic security analysis  on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );
    const stopDynamicSecurityAnalysisUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-security-analysis/stop';
    console.debug(stopDynamicSecurityAnalysisUrl);
    return backendFetch(stopDynamicSecurityAnalysisUrl, { method: 'put' });
}

export function fetchDynamicSecurityAnalysisStatus(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<string | null> {
    console.info(
        `Fetching dynamic security analysis status on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-security-analysis/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSecurityAnalysisProvider() {
    console.info('Fetching default dynamic security analysis provider');
    const url = PREFIX_STUDY_QUERIES + '/v1/dynamic-security-analysis-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSecurityAnalysisProvider(studyUuid: UUID, newProvider: string) {
    console.info(`Updating dynamic security analysis provider on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-security-analysis/provider';
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

export function fetchDynamicSecurityAnalysisParameters(
    studyUuid: UUID
): Promise<DynamicSecurityAnalysisParametersFetchReturn> {
    console.info(`Fetching dynamic security analysis parameters on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-security-analysis/parameters';
    console.debug(url);
    const parametersPromise: Promise<DynamicSecurityAnalysisParametersInfos> = backendFetchJson(url);

    // enrich contingency list uuids by contingency list infos with id and name
    return parametersPromise.then((parameters) => {
        if (parameters?.contingencyListIds) {
            return fetchContingencyAndFiltersLists(parameters?.contingencyListIds).then((contingencyListInfos) => {
                delete parameters.contingencyListIds;
                return {
                    ...parameters,
                    contingencyListInfos: contingencyListInfos?.map((info) => ({
                        id: info.elementUuid,
                        name: info.elementName,
                    })),
                };
            });
        }
        delete parameters.contingencyListIds;
        return {
            ...parameters,
            contingencyListInfos: [],
        };
    });
}

export function updateDynamicSecurityAnalysisParameters(
    studyUuid: UUID,
    newParams: DynamicSecurityAnalysisParametersFetchReturn | null
): Promise<void> {
    console.info(`Setting dynamic security analysis parameters on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-security-analysis/parameters';
    console.debug(url);

    // send to back contingency list uuids instead of contingency list infos
    const newParameters =
        newParams != null
            ? {
                  ...newParams,
                  contingencyListIds: newParams?.contingencyListInfos?.map((info) => info.id),
              }
            : newParams;

    delete newParameters?.contingencyListInfos;

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParameters),
    });
}
