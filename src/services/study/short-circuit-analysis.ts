/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import {
    getShortCircuitAnalysisTypeFromEnum,
    ShortCircuitAnalysisType,
} from '../../components/results/shortcircuit/shortcircuit-analysis-result.type';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import type { UUID } from 'node:crypto';
import { FilterConfig, SortConfig } from '../../types/custom-aggrid-types';
import { GlobalFilters } from '../../components/results/common/global-filter/global-filter-types';
import { GsLang } from '@gridsuite/commons-ui';

interface ShortCircuitAnalysisResult {
    studyUuid: UUID | null;
    currentNodeUuid?: UUID;
    currentRootNetworkUuid?: UUID;
    type: ShortCircuitAnalysisType;
    globalFilters?: GlobalFilters;
}
interface Selector {
    page: number;
    size: number;
    filter: FilterConfig[] | null;
    sort: SortConfig[];
}
interface ShortCircuitAnalysisPagedResults extends ShortCircuitAnalysisResult {
    selector: Partial<Selector>;
}

export function startShortCircuitAnalysis(
    studyUuid: string,
    currentNodeUuid: UUID | undefined,
    currentRootNetworkUuid: UUID | null,
    busId: string,
    debug?: boolean
): Promise<void> {
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
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);

    console.info(
        `Fetching ${analysisType} short circuit analysis result on '${studyUuid}' , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}'...`
    );

    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('paged', 'true');

    if (analysisType) {
        urlSearchParams.append('type', analysisType);
    }

    const { page = 0, sort, size, filter } = selector;

    urlSearchParams.append('page', String(page));

    sort?.map((value) => urlSearchParams.append('sort', `${value.colId},${value.sort}`));

    if (size) {
        urlSearchParams.append('size', String(size));
    }

    if (filter?.length) {
        urlSearchParams.append('filters', JSON.stringify(filter));
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

export function downloadShortCircuitResultZippedCsv(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    analysisType: number,
    headersCsv: string[] | undefined,
    enumValueTranslations: Record<string, string>,
    language: GsLang
) {
    console.info(
        `Fetching short-circuit analysis export csv on ${studyUuid} , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}'...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/shortcircuit/result/csv`;
    const type = getShortCircuitAnalysisTypeFromEnum(analysisType);
    const param = new URLSearchParams();
    if (type) {
        param.append('type', type);
    }
    const urlWithParam = `${url}?${param.toString()}`;
    console.debug(urlWithParam);
    return backendFetch(urlWithParam, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headersCsv, enumValueTranslations, language }),
    });
}
