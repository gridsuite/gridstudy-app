/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Event } from '../components/dialogs/dynamicsimulation/event/types/event.type';
import {
    backendFetch,
    backendFetchJson,
    getRequestParamFromList,
} from './utils';
import { getStudyUrlWithNodeUuid } from './study';

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

// --- Event API - BEGIN

export function fetchDynamicSimulationEvents(
    studyUuid: string,
    nodeUuid: string
): Promise<Event[]> {
    console.info(
        `Fetching dynamic simulation events on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/dynamic-simulation/events';

    console.debug(url);

    return backendFetchJson(url);
}

export function fetchDynamicSimulationEvent(
    studyUuid: string,
    nodeUuid: string,
    equipmentId: string
): Promise<Event> {
    console.info(
        `Fetching dynamic simulation event with '${equipmentId}' on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        `/dynamic-simulation/events?equipmentId=${equipmentId}`;

    console.debug(url);

    return backendFetchJson(url);
}

export function saveDynamicSimulationEvent(
    studyUuid: string,
    nodeUuid: string,
    event: Event
) {
    console.info(
        `Saving dynamic simulation event on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        `/dynamic-simulation/events`;
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

export function deleteDynamicSimulationEvents(
    studyUuid: string,
    nodeUuid: string,
    events: Event[]
) {
    console.info(
        `Delete dynamic simulation events on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const eventIdsParams = getRequestParamFromList(
        events.map((event) => event.uuid),
        'eventUuids'
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        `/dynamic-simulation/events?${eventIdsParams}`;

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
