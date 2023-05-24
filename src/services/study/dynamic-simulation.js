/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';

import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    getRequestParamFromList,
} from '../../utils/rest-api';

function getDynamicSimulationPath(studyUuid, currentNodeUuid) {
    return `${
        currentNodeUuid
            ? getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)
            : getStudyUrl(studyUuid)
    }${STUDY_PATHS.dynamicSimulation}`;
}

export function fetchDynamicSimulationProvider(studyUuid) {
    console.info('fetch dynamic simulation provider');
    const url = `${getDynamicSimulationPath(studyUuid)}/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSimulationProvider() {
    console.info('fetch default dynamic simulation provider');
    const url = `${getStudyUrl()}${
        STUDY_PATHS.dynamicSimulationDefaultProvider
    }`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSimulationProvider(studyUuid, newProvider) {
    console.info('update dynamic simulation provider');
    const url = `${getDynamicSimulationPath(studyUuid)}/provider`;
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

export function getDynamicMappings(studyUuid) {
    console.info(`Fetching dynamic mappings on '${studyUuid}' ...`);
    const url = `${getDynamicSimulationPath(studyUuid)}/mappings`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationParameters(studyUuid) {
    console.info(
        `Fetching dynamic simulation parameters on '${studyUuid}' ...`
    );

    const url = `${getDynamicSimulationPath(studyUuid)}/parameters`;

    console.debug(url);

    const parametersPromise = backendFetchJson(url);

    const mappingsPromise = getDynamicMappings(studyUuid);

    return Promise.all([parametersPromise, mappingsPromise]).then(
        ([parameters, mappings]) => ({ ...parameters, mappings })
    );
}

export function updateDynamicSimulationParameters(studyUuid, newParams) {
    console.info('set dynamic simulation parameters');
    const url = `${getDynamicSimulationPath(studyUuid)}/parameters`;
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

export function startDynamicSimulation(
    studyUuid,
    currentNodeUuid,
    dynamicSimulationConfiguration
) {
    console.info(
        `Running dynamic simulation on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startDynamicSimulationUrl = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/run`;

    // add body
    const body = JSON.stringify(dynamicSimulationConfiguration ?? {});

    console.debug({ startDynamicSimulationUrl, body });

    return backendFetchJson(startDynamicSimulationUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function stopDynamicSimulation(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping dynamic simulation on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopDynamicSimulationUrl = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/stop`;
    console.debug(stopDynamicSimulationUrl);
    return backendFetch(stopDynamicSimulationUrl, { method: 'put' });
}

export function fetchDynamicSimulationResultTimeSeries(
    studyUuid,
    currentNodeUuid,
    timeSeriesNames
) {
    console.info(
        `Fetching dynamic simulation time series result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    // Add params to Url
    const timeSeriesParams = getRequestParamFromList(
        timeSeriesNames,
        'timeSeriesNames'
    );
    const urlSearchParams = new URLSearchParams(timeSeriesParams);

    const url = `${getDynamicMappings(
        studyUuid,
        currentNodeUuid
    )}/result/timeseries?${urlSearchParams}`;

    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationResultTimeLine(
    studyUuid,
    currentNodeUuid
) {
    console.info(
        `Fetching dynamic simulation timeline result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/result/timeline`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching dynamic simulation status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/status`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationTimeSeriesMetadata(
    studyUuid,
    currentNodeUuid
) {
    console.info(
        `Fetching dynamic simulation time series's metadata on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const url = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/result/timeseries/metadata`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationResult(studyUuid, currentNodeUuid) {
    // fetch parallel different results
    const timeseriesMetadataPromise = fetchDynamicSimulationTimeSeriesMetadata(
        studyUuid,
        currentNodeUuid
    );
    const statusPromise = fetchDynamicSimulationStatus(
        studyUuid,
        currentNodeUuid
    );
    return Promise.all([timeseriesMetadataPromise, statusPromise]).then(
        ([timeseriesMetadatas, status]) => ({
            timeseriesMetadatas,
            status,
        })
    );
}
