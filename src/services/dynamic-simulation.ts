/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '../utils/rest-api';
import { Event } from '../components/dialogs/dynamicsimulation/event/types/event.type';

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
    const foundIndex = eventStore.findIndex(
        (elem) => elem.staticId === event.staticId
    );

    if (foundIndex != -1) {
        // replace
        eventStore.splice(foundIndex, 1, event);
    } else {
        // put a new
        eventStore.push(event);
    }

    localStorage.setItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid,
        JSON.stringify(eventStore)
    );
    return event;
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
    const foundEvent = eventStore.find((elem) => elem.staticId === equipmentId);

    return foundEvent;
}

async function deleteEventAsync(
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
    const foundIndex = eventStore.findIndex(
        (elem) => elem.staticId == event.staticId
    );

    if (foundIndex != -1) {
        // replace
        eventStore.splice(foundIndex, 1);
    }

    localStorage.setItem(
        EVENT_STORE_KEY + studyUuid + nodeUuid,
        JSON.stringify(eventStore)
    );

    return event;
}

export function saveEvent(studyUuid: string, nodeUuid: string, event: Event) {
    return saveEventAsync(studyUuid, nodeUuid, event, 1000);
}

export function getEvent(
    studyUuid: string,
    nodeUuid: string,
    equipmentId: string
) {
    return getEventAsync(studyUuid, nodeUuid, equipmentId, 1000);
}
