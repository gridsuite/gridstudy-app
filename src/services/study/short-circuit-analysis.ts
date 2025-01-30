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
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { UUID } from 'crypto';
import { INITIAL_VOLTAGE, PREDEFINED_PARAMETERS } from '../../components/utils/constants';
import { FilterConfig, SortConfig } from '../../types/custom-aggrid-types';

interface ShortCircuitAnalysisResult {
    studyUuid: UUID | null;
    currentNodeUuid?: UUID;
    currentRootNetworkUuid?: UUID;
    type: ShortCircuitAnalysisType;
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
interface VoltageRanges {
    maximumNominalVoltage: number;
    minimumNominalVoltage: number;
    voltage: number;
    voltageRangeCoefficient: number;
}
interface ShortCircuitParameters {
    predefinedParameters: NonNullable<PREDEFINED_PARAMETERS | undefined>;
    parameters: {
        withFeederResult: boolean;
        withLoads: boolean;
        withVSCConverterStations: boolean;
        withShuntCompensators: boolean;
        withNeutralPosition: boolean;
        initialVoltageProfileMode: NonNullable<INITIAL_VOLTAGE | undefined>;
        voltageRanges?: VoltageRanges;
    };
}

export function startShortCircuitAnalysis(
    studyUuid: string,
    currentNodeUuid: UUID | undefined,
    currentRootNetworkUuid: UUID | null,
    busId: string
) {
    console.info(
        `Running short circuit analysis on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    busId && urlSearchParams.append('busId', busId);

    const startShortCircuitAnalysisUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/shortcircuit/run?' +
        urlSearchParams.toString();
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
}: ShortCircuitAnalysisResult) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);

    console.info(
        `Fetching ${analysisType} short circuit analysis result on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    if (analysisType) {
        urlSearchParams.append('type', analysisType);
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

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/shortcircuit/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function getShortCircuitParameters(studyUuid: UUID) {
    console.info('get short-circuit parameters');
    const getShortCircuitParams = getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}

export function setShortCircuitParameters(studyUuid: UUID | null, newParams: ShortCircuitParameters) {
    console.info('set short-circuit parameters');
    const url = getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(url);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newParams ? JSON.stringify(newParams) : null,
    });
}

export function invalidateShortCircuitStatus(studyUuid: UUID | null) {
    console.info('invalidate short circuit status');
    const invalidateShortCircuitStatusUrl = getStudyUrl(studyUuid) + '/short-circuit/invalidate-status';
    console.debug(invalidateShortCircuitStatusUrl);
    return backendFetch(invalidateShortCircuitStatusUrl, {
        method: 'PUT',
    });
}

export function downloadShortCircuitResultZippedCsv(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    analysisType: number,
    headersCsv: string[] | undefined,
    enumValueTranslations: Record<string, string>
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
        body: JSON.stringify({ headersCsv, enumValueTranslations }),
    });
}
