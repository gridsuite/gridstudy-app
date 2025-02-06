/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Event } from '../components/dialogs/dynamicsimulation/event/types/event.type';
import { backendFetch, backendFetchJson, getRequestParamFromList } from './utils';
import { getStudyUrlWithNodeUuid, getStudyUrlWithNodeUuidAndRootNetworkUuid } from './study';
import { UUID } from 'crypto';
import {
    TimelineEvent,
    TimeSeriesMetadata,
} from '../components/results/dynamicsimulation/types/dynamic-simulation-result.type';

const PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/dynamic-simulation';

// -- Parameters API - BEGIN
function getDynamicSimulationUrl() {
    return `${PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES}/v1/`;
}

export function fetchDynamicSimulationProviders() {
    console.info('fetch dynamic simulation providers');
    const url = getDynamicSimulationUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationTimeSeriesMetadata(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<TimeSeriesMetadata[] | null> {
    console.info(
        `Fetching dynamic simulation time series's metadata on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
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
        `Fetching dynamic simulation timeline result on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-simulation/result/timeline';
    console.debug(url);
    return backendFetchJson(url);
}

// --- Event API - BEGIN
export function fetchDynamicSimulationEvents(studyUuid: UUID, nodeUuid: UUID): Promise<Event[]> {
    console.info(`Fetching dynamic simulation events on '${studyUuid}' and node '${nodeUuid}' ...`);

    const url = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/dynamic-simulation/events';

    console.debug(url);

    return backendFetchJson(url);
}

export function fetchDynamicSimulationEvent(studyUuid: UUID, nodeUuid: UUID, equipmentId: string): Promise<Event> {
    console.info(
        `Fetching dynamic simulation event with '${equipmentId}' on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + `/dynamic-simulation/events?equipmentId=${equipmentId}`;

    console.debug(url);

    return backendFetchJson(url);
}

export function saveDynamicSimulationEvent(studyUuid: UUID, nodeUuid: UUID, event: Event) {
    console.info(`Saving dynamic simulation event on '${studyUuid}' and node '${nodeUuid}' ...`);

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
    console.info(`Delete dynamic simulation events on '${studyUuid}' and node '${nodeUuid}' ...`);

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
