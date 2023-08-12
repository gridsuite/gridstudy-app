/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Event } from '../components/dialogs/dynamicsimulation/event/types/event.type';
import { backendFetchJson } from './utils';
import { UUID, randomUUID } from 'crypto';
import { getStudyUrlWithNodeUuid } from './study';

const PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/dynamic-simulation`;

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

// --- REAL Event API - BEGIN

export function fetchDynamicSimulationEvents(
    studyUuid: UUID,
    nodeUuid: UUID
): Promise<Event> {
    console.info(
        `Fetching dynamic simulation events on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/dynamic-simulation/events';

    console.debug(url);

    return backendFetchJson(url);
}

// -- Event API - BEGIN

const EVENT_STORE_KEY = 'event_store_key';

async function saveEventAsync(
    studyUuid: string,
    nodeUuid: string,
    event: Event,
    syncTime?: number
) {
    await new Promise((resolve) => setTimeout(resolve, syncTime ?? 1000));

    const eventStoreJson = localStorage.getItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid
    );
    const eventStore = eventStoreJson
        ? (JSON.parse(eventStoreJson) as Event[])
        : [];
    const foundIndex = eventStore.findIndex((elem) => elem.id === event.id);

    if (foundIndex !== -1) {
        // replace
        eventStore.splice(foundIndex, 1, event);
    } else {
        // put a new
        eventStore.push({ id: randomUUID(), ...event });
    }

    localStorage.setItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid,
        JSON.stringify(eventStore)
    );
    return event;
}

async function getEventsAsync(
    studyUuid: string,
    nodeUuid: string,
    syncTime?: number
) {
    await new Promise((resolve) => setTimeout(resolve, syncTime ?? 1000));

    const eventStoreJson = localStorage.getItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid
    );
    const eventStore = eventStoreJson
        ? (JSON.parse(eventStoreJson) as Event[])
        : [];

    return eventStore;
}

async function getEventAsync(
    studyUuid: string,
    nodeUuid: string,
    equipmentId: string,
    syncTime?: number
) {
    await new Promise((resolve) => setTimeout(resolve, syncTime ?? 1000));

    const eventStoreJson = localStorage.getItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid
    );
    const eventStore = eventStoreJson
        ? (JSON.parse(eventStoreJson) as Event[])
        : [];
    const foundEvent = eventStore.find((elem) =>
        elem.properties.some(
            (item) => item.name === 'staticId' && item.value === equipmentId
        )
    );

    return foundEvent;
}

async function deleteEventAsync(
    studyUuid: string,
    nodeUuid: string,
    events: Event[],
    syncTime?: number
) {
    await new Promise((resolve) => setTimeout(resolve, syncTime ?? 1000));
    const eventStoreJson = localStorage.getItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid
    );
    const eventStore = eventStoreJson
        ? (JSON.parse(eventStoreJson) as Event[])
        : [];

    events.forEach((event) => {
        const foundIndex = eventStore.findIndex((elem) => elem.id === event.id);

        if (foundIndex !== -1) {
            // replace
            eventStore.splice(foundIndex, 1);
        }
    });

    localStorage.setItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid,
        JSON.stringify(eventStore)
    );

    return events;
}

async function changeEventOrderAsync(
    studyUuid: string,
    nodeUuid: string,
    itemUuid?: UUID,
    beforeUuid?: UUID,
    syncTime?: number
) {
    await new Promise((resolve) => setTimeout(resolve, syncTime ?? 1000));
    const eventStoreJson = localStorage.getItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid
    );
    const eventStore = eventStoreJson
        ? (JSON.parse(eventStoreJson) as Event[])
        : [];

    localStorage.setItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid,
        JSON.stringify(eventStore)
    );
}

export function saveEvent(studyUuid: string, nodeUuid: string, event: Event) {
    return saveEventAsync(studyUuid, nodeUuid, event, 1000);
}

export function getEvents(studyUuid: string, nodeUuid: string) {
    return getEventsAsync(studyUuid, nodeUuid, 1000);
}

export function getEvent(
    studyUuid: string,
    nodeUuid: string,
    equipmentId: string
) {
    return getEventAsync(studyUuid, nodeUuid, equipmentId, 1000);
}

export function deleteEvent(
    studyUuid: string,
    nodeUuid: string,
    events: Event[]
) {
    return deleteEventAsync(studyUuid, nodeUuid, events, 1000);
}

export function changeEventOrder(
    studyUuid: string,
    nodeUuid: string,
    itemUuid?: UUID,
    beforeUuid?: UUID
) {
    return changeEventOrderAsync(
        studyUuid,
        nodeUuid,
        itemUuid,
        beforeUuid,
        1000
    );
}
