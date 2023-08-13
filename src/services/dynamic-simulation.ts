/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Event } from '../components/dialogs/dynamicsimulation/event/types/event.type';
import { backendFetchJson } from './utils';
import { getStudyUrlWithNodeUuid } from './study';

function generateUUID() {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 =
        (typeof performance !== 'undefined' &&
            performance.now &&
            performance.now() * 1000) ||
        0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) {
                //Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                //Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
}

function getMaxOrderByNodeId(eventStore: Event[]) {
    if (eventStore.length === 0) {
        return -1; // mean undefined
    }

    // sort by eventOrder then get the last event
    return eventStore.sort((a, b) => a.eventOrder - b.eventOrder)[
        eventStore.length - 1
    ].eventOrder;
}

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
    studyUuid: string,
    nodeUuid: string
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
        eventStore.push({
            ...event,
            id: generateUUID(),
            eventOrder: getMaxOrderByNodeId(eventStore) + 1,
        });
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
    itemUuid?: string,
    beforeUuid?: string,
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
    itemUuid?: string,
    beforeUuid?: string
) {
    return changeEventOrderAsync(
        studyUuid,
        nodeUuid,
        itemUuid,
        beforeUuid,
        1000
    );
}
