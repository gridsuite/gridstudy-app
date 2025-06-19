/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    getStudyUrl,
    getStudyUrlWithNodeUuid,
    getStudyUrlWithNodeUuidAndRootNetworkUuid,
    PREFIX_STUDY_QUERIES,
} from './index';

import { backendFetch, backendFetchJson, backendFetchText, getRequestParamFromList } from '../utils';
import { UUID } from 'crypto';
import { DynamicSimulationParametersFetchReturn, DynamicSimulationParametersInfos } from './dynamic-simulation.type';
import {
    SimpleTimeSeriesMetadata,
    TimelineEvent,
    Timeseries,
} from '../../components/results/dynamicsimulation/types/dynamic-simulation-result.type';
import { Event } from '../../components/dialogs/dynamicsimulation/event/types/event.type';

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
}): Promise<void> {
    console.info(
        `Running dynamic simulation on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlParams = new URLSearchParams();

    if (debug) {
        urlParams.append('debug', `${debug}`);
    }

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
        `Stopping dynamic simulation on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
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
        `Fetching dynamic simulation time series result on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
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
    console.info(`Fetching dynamic simulation models on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/models';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationProvider(studyUuid: UUID) {
    console.info(`Fetching dynamic simulation provider on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSimulationProvider() {
    console.info('Fetching default dynamic simulation provider');
    const url = PREFIX_STUDY_QUERIES + '/v1/dynamic-simulation-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSimulationProvider(studyUuid: UUID, newProvider: string) {
    console.info(`Updating dynamic simulation provider on study '${studyUuid}' ...`);
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
    console.info(`Fetching dynamic simulation parameters on study '${studyUuid}' ...`);
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
    console.info(`Setting dynamic simulation parameters on study '${studyUuid}' ...`);
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

export function fetchDynamicSimulationTimeSeriesMetadata(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<SimpleTimeSeriesMetadata[] | null> {
    console.info(
        `Fetching dynamic simulation time series's metadata on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-simulation/result/timeseries/metadata';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationResultTimeline(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<TimelineEvent[] | null> {
    console.info(
        `Fetching dynamic simulation timeline result on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-simulation/result/timeline';
    console.debug(url);
    return backendFetchJson(url);
}

// --- Event API - BEGIN
export function fetchDynamicSimulationEvents(studyUuid: UUID, nodeUuid: UUID): Promise<Event[]> {
    console.info(`Fetching dynamic simulation events on study '${studyUuid}' and node '${nodeUuid}' ...`);

    const url = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/dynamic-simulation/events';

    console.debug(url);

    return backendFetchJson(url);
}

export function fetchDynamicSimulationEvent(studyUuid: UUID, nodeUuid: UUID, equipmentId: string): Promise<Event> {
    console.info(
        `Fetching dynamic simulation event with equipment '${equipmentId}' on study '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + `/dynamic-simulation/events?equipmentId=${equipmentId}`;

    console.debug(url);

    return backendFetchJson(url);
}

export function saveDynamicSimulationEvent(studyUuid: UUID, nodeUuid: UUID, event: Event) {
    console.info(`Saving dynamic simulation event on study '${studyUuid}' and node '${nodeUuid}' ...`);

    const url = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + `/dynamic-simulation/events`;
    console.debug(url);

    return backendFetch(url, {
        method: event.uuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    });
}

export function deleteDynamicSimulationEvents(studyUuid: UUID, nodeUuid: UUID, events: Event[]) {
    console.info(`Delete dynamic simulation events on study '${studyUuid}' and node '${nodeUuid}' ...`);

    const eventIdsParams = getRequestParamFromList(
        events.map((event) => event.uuid),
        'eventUuids'
    );

    const url = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + `/dynamic-simulation/events?${eventIdsParams}`;

    console.debug(url);

    return backendFetch(url, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}
// --- Event API - END
