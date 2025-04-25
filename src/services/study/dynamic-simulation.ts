/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from './index';

import { backendFetch, backendFetchJson, backendFetchText, getRequestParamFromList } from '../utils';
import { UUID } from 'crypto';
import { DynamicSimulationParametersFetchReturn, DynamicSimulationParametersInfos } from './dynamic-simulation.type';
import { Timeseries } from '../../components/results/dynamicsimulation/types/dynamic-simulation-result.type';

export function getDynamicMappings(studyUuid: UUID) {
    console.info(`Fetching dynamic mappings on '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/mappings';
    console.debug(url);
    return backendFetchJson(url);
}

export function startDynamicSimulation({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    dynamicSimulationConfiguration,
    debug,
}: {
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    dynamicSimulationConfiguration?: DynamicSimulationParametersInfos;
    debug: boolean;
}) {
    console.info(
        `Running dynamic simulation on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlParams = new URLSearchParams();
    urlParams.append('debug', `${debug}`);

    const startDynamicSimulationUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/dynamic-simulation/run?${urlParams}`;

    // add body
    const body = JSON.stringify(dynamicSimulationConfiguration ?? {});

    console.debug({ startDynamicSimulationUrl, body });

    return backendFetch(startDynamicSimulationUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function stopDynamicSimulation(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping dynamic simulation on '${studyUuid}' for root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopDynamicSimulationUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-simulation/stop';
    console.debug(stopDynamicSimulationUrl);
    return backendFetch(stopDynamicSimulationUrl, { method: 'put' });
}

export function fetchDynamicSimulationStatus(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<string | null> {
    console.info(
        `Fetching dynamic simulation status on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-simulation/status';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationResultTimeSeries(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    timeSeriesNames: string[]
): Promise<Timeseries[]> {
    console.info(
        `Fetching dynamic simulation time series result on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    // Add params to Url
    const timeSeriesParams = getRequestParamFromList(timeSeriesNames, 'timeSeriesNames');
    const urlSearchParams = new URLSearchParams(timeSeriesParams);

    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/dynamic-simulation/result/timeseries?${urlSearchParams}`;

    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationModels(studyUuid: UUID | null) {
    console.info(`Fetching dynamic simulation models on '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/models';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationProvider(studyUuid: UUID) {
    console.info('fetch dynamic simulation provider');
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSimulationProvider() {
    console.info('fetch default dynamic simulation provider');
    const url = PREFIX_STUDY_QUERIES + '/v1/dynamic-simulation-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSimulationProvider(studyUuid: UUID, newProvider: string) {
    console.info('update dynamic simulation provider');
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/provider';
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

export function fetchDynamicSimulationParameters(studyUuid: UUID): Promise<DynamicSimulationParametersFetchReturn> {
    console.info(`Fetching dynamic simulation parameters on '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/parameters';
    console.debug(url);
    const parametersPromise = backendFetchJson(url); // return DynamicSimulationParametersInfos
    const mappingsPromise = getDynamicMappings(studyUuid); // return mappings

    return Promise.all([parametersPromise, mappingsPromise]).then(([parameters, mappings]) => ({
        ...parameters,
        mappings,
    }));
}

export function updateDynamicSimulationParameters(studyUuid: UUID, newParams: DynamicSimulationParametersInfos | null) {
    console.info('set dynamic simulation parameters');
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/parameters';
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
