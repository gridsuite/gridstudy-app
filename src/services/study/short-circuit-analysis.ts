/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import {
    getShortCircuitAnalysisTypeFromEnum,
    ShortCircuitAnalysisType,
} from '../../components/results/shortcircuit/shortcircuit-analysis-result.type';
import { GsLangUser, backendFetch, backendFetchJson, backendFetchText } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { GlobalFilters } from '../../components/results/common/global-filter/global-filter-types';
import { Selector } from 'components/results/common/utils';

const PREFIX_SHORTCIRCUIT_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/shortcircuit';

export function getShortCircuitUrl() {
    return `${PREFIX_SHORTCIRCUIT_SERVER_QUERIES}/v1/`;
}

interface ShortCircuitAnalysisResult {
    studyUuid: UUID | null;
    currentNodeUuid?: UUID;
    currentRootNetworkUuid?: UUID;
    type: ShortCircuitAnalysisType;
    globalFilters?: GlobalFilters;
}
interface ShortCircuitAnalysisPagedResults extends ShortCircuitAnalysisResult {
    selector: Partial<Selector>;
}

// Matches CsvExportParams in short-circuit-server
export type ShortCircuitCsvExportParams = {
    csvHeader: string[] | undefined;
    enumValueTranslations: Record<string, string>;
    language: GsLangUser;
    oneBusCase: boolean;
};
interface ShortCircuitAnalysisResultCsv extends ShortCircuitAnalysisPagedResults {
    csvParams: ShortCircuitCsvExportParams;
}

export function startShortCircuitAnalysis(
    studyUuid: string,
    currentNodeUuid: UUID | undefined,
    currentRootNetworkUuid: UUID | null,
    busId: string,
    debug?: boolean
): Promise<Response> {
    console.info(
        `Running short circuit analysis on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    busId && urlSearchParams.append('busId', busId);

    if (debug) {
        urlSearchParams.append('debug', `${debug}`);
    }

    const startShortCircuitAnalysisUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid)}/shortcircuit/run?${urlSearchParams}`;
    console.debug(startShortCircuitAnalysisUrl);
    return backendFetch(startShortCircuitAnalysisUrl, { method: 'put' });
}

export function stopShortCircuitAnalysis(
    studyUuid: string,
    currentNodeUuid: UUID | undefined,
    currentRootNetworkUuid: UUID | undefined
) {
    console.info(
        `Stopping short circuit analysis on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopShortCircuitAnalysisUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/shortcircuit/stop';
    console.debug(stopShortCircuitAnalysisUrl);
    return backendFetch(stopShortCircuitAnalysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    type = ShortCircuitAnalysisType.ALL_BUSES
) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);
    console.info(
        `Fetching ${analysisType} short circuit analysis status on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    if (analysisType !== null) {
        urlSearchParams.append('type', analysisType);
    }
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/shortcircuit/status?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchText(url);
}

export function fetchOneBusShortCircuitAnalysisStatus(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
) {
    return fetchShortCircuitAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        ShortCircuitAnalysisType.ONE_BUS
    );
}

export function fetchShortCircuitAnalysisResult({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    type,
    globalFilters,
}: ShortCircuitAnalysisResult) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);

    console.info(
        `Fetching ${analysisType} short circuit analysis result on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    if (analysisType) {
        urlSearchParams.append('type', analysisType);
    }
    if (globalFilters && Object.keys(globalFilters).length > 0) {
        urlSearchParams.append('globalFilters', JSON.stringify(globalFilters));
    }

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/shortcircuit/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchShortCircuitAnalysisPagedResults({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    selector = {},
    type = ShortCircuitAnalysisType.ALL_BUSES,
    globalFilters,
}: ShortCircuitAnalysisPagedResults) {
    const { page = 0, size } = selector;
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);
    const urlSearchParams = getShortCircuitResultUrlParams(analysisType, selector, globalFilters);

    console.info(
        `Fetching ${analysisType} short circuit analysis result on '${studyUuid}' , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}'...`
    );

    urlSearchParams.append('paged', 'true');
    urlSearchParams.append('page', String(page));
    if (size) {
        urlSearchParams.append('size', String(size));
    }

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/shortcircuit/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function downloadShortCircuitResultZippedCsv({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    type,
    globalFilters,
    selector,
    csvParams,
}: ShortCircuitAnalysisResultCsv) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);
    const urlSearchParams = getShortCircuitResultUrlParams(analysisType, selector, globalFilters);

    console.info(
        `Fetching short-circuit analysis export csv on ${studyUuid} , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}'...`
    );

    const urlWithParam =
        `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid
        )}/shortcircuit/result/csv?` + urlSearchParams.toString();

    console.debug(urlWithParam);
    return backendFetch(urlWithParam, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvParams),
    });
}

function getShortCircuitResultUrlParams(
    analysisType: string | null,
    selector: Partial<Selector>,
    globalFilters: GlobalFilters | undefined
) {
    const urlSearchParams = new URLSearchParams();
    const { sort, filter } = selector;

    if (analysisType) {
        urlSearchParams.append('type', analysisType);
    }

    sort?.map((value) => urlSearchParams.append('sort', `${value.colId},${value.sort}`));

    if (filter?.length) {
        urlSearchParams.append('filters', JSON.stringify(filter));
    }
    if (globalFilters && Object.keys(globalFilters).length > 0) {
        urlSearchParams.append('globalFilters', JSON.stringify(globalFilters));
    }

    return urlSearchParams;
}

export function setShortCircuitParameters(studyUuid: UUID, newParams: any) {
    console.info('set short circuit parameters');
    const setShortCircuitParametersUrl = getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(setShortCircuitParametersUrl);
    return backendFetch(setShortCircuitParametersUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newParams ? JSON.stringify(newParams) : null,
    });
}

export function getShortCircuitParameters(studyUuid: UUID) {
    console.info('get short circuit parameters');
    const getScParams = getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(getScParams);
    return backendFetchJson(getScParams);
}

export function getShortCircuitSpecificParametersDescription() {
    console.info('get short circuit specific parameters description');
    const getShortCircuitSpecificParametersUrl = getShortCircuitUrl() + 'parameters/specific-parameters';
    console.debug(getShortCircuitSpecificParametersUrl);
    return backendFetchJson(getShortCircuitSpecificParametersUrl);
}
