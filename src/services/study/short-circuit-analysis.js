/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid } from './index';
import {
    getShortcircuitAnalysisTypeFromEnum,
    ShortcircuitAnalysisType,
} from '../../components/results/shortcircuit/shortcircuit-analysis-result.type';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

export function startShortCircuitAnalysis(studyUuid, currentNodeUuid, busId) {
    console.info(
        `Running short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlSearchParams = new URLSearchParams();
    busId && urlSearchParams.append('busId', busId);

    const startShortCircuitAnanysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/run?' +
        urlSearchParams.toString();
    console.debug(startShortCircuitAnanysisUrl);
    return backendFetch(startShortCircuitAnanysisUrl, { method: 'put' });
}

export function stopShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopShortCircuitAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/stop';
    console.debug(stopShortCircuitAnalysisUrl);
    return backendFetch(stopShortCircuitAnalysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(
    studyUuid,
    currentNodeUuid,
    type = ShortcircuitAnalysisType.ALL_BUSES
) {
    const analysisType = getShortcircuitAnalysisTypeFromEnum(type);
    console.info(
        `Fetching ${analysisType} short circuit analysis status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('type', analysisType);
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/status?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchText(url);
}

export function fetchOneBusShortCircuitAnalysisStatus(
    studyUuid,
    currentNodeUuid
) {
    return fetchShortCircuitAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        ShortcircuitAnalysisType.ONE_BUS
    );
}

export function fetchShortCircuitAnalysisResult({
    studyUuid,
    currentNodeUuid,
    selector = {},
    type = getShortcircuitAnalysisTypeFromEnum(
        ShortcircuitAnalysisType.ALL_BUSES
    ),
}) {
    console.info(
        `Fetching ${type} short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('mode', 'FULL');

    if (type) {
        urlSearchParams.append('type', type);
    }

    const { page = '0', sort, size } = selector;

    urlSearchParams.append('page', page);

    if (sort) {
        urlSearchParams.append('sort', sort);
    }
    if (size) {
        urlSearchParams.append('size', size);
    }

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/results/fault_results/paged?' +
        urlSearchParams.toString();

    console.debug(url);
    return backendFetchJson(url);
}

export function fetchOneBusShortCircuitAnalysisResult({
    studyUuid,
    currentNodeUuid,
}) {
    const type = getShortcircuitAnalysisTypeFromEnum(
        ShortcircuitAnalysisType.ONE_BUS
    );

    console.info(
        `Fetching ${type} short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('mode', 'FULL');
    type && urlSearchParams.append('type', type);

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function getShortCircuitParameters(studyUuid) {
    console.info('get short-circuit parameters');
    const getShortCircuitParams =
        getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}

export function setShortCircuitParameters(studyUuid, newParams) {
    console.info('set short-circuit parameters');

    const { predefinedParams } = newParams;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('predefinedParam', predefinedParams);
    const setShortCircuitParametersUrl =
        getStudyUrl(studyUuid) +
        '/short-circuit-analysis/parameters?' +
        urlSearchParams.toString();
    console.debug(setShortCircuitParametersUrl);
    delete newParams.predefinedParams;

    console.log(' data*********** ', newParams);

    const voltageRage = [
        {
            voltageRangeCoefficient: '1.1',
            minimumNominalVoltage: '20',
            maximumNominalVoltage: '22',
        },

        {
            voltageRangeCoefficient: '1.1',
            minimumNominalVoltage: '45',
            maximumNominalVoltage: '49.5',
        },

        {
            voltageRangeCoefficient: '1.1',
            minimumNominalVoltage: '63',
            maximumNominalVoltage: '69.3',
        },

        {
            voltageRangeCoefficient: '1.1',
            minimumNominalVoltage: '90',
            maximumNominalVoltage: '99',
        },

        {
            voltageRangeCoefficient: '1.1',
            minimumNominalVoltage: '150',
            maximumNominalVoltage: '165',
        },

        {
            voltageRangeCoefficient: '1.09',
            minimumNominalVoltage: '225',
            maximumNominalVoltage: '245',
        },
        {
            voltageRangeCoefficient: '1.05',
            minimumNominalVoltage: '400',
            maximumNominalVoltage: '420',
        },
    ];

    return backendFetch(setShortCircuitParametersUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newParams, voltageRanges: voltageRage }),
    });
}
export function invalidateShortCircuitStatus(studyUuid) {
    console.info('invalidate short circuit status');
    const invalidateShortCircuitStatusUrl =
        getStudyUrl(studyUuid) + '/short-circuit/invalidate-status';
    console.debug(invalidateShortCircuitStatusUrl);
    return backendFetch(invalidateShortCircuitStatusUrl, {
        method: 'PUT',
    });
}
