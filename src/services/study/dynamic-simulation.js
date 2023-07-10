import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    getRequestParamFromList,
} from '../../utils/rest-api';
import {
    getStudyUrl,
    getStudyUrlWithNodeUuid,
    PREFIX_STUDY_QUERIES,
} from './index';

export function getDynamicMappings(studyUuid) {
    console.info(`Fetching dynamic mappings on '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/mappings';
    console.debug(url);
    return backendFetchJson(url);
}

export function startDynamicSimulation(
    studyUuid,
    currentNodeUuid,
    dynamicSimulationConfiguration
) {
    console.info(
        `Running dynamic simulation on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startDynamicSimulationUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/dynamic-simulation/run`;

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
    const stopDynamicSimulationUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/stop';
    console.debug(stopDynamicSimulationUrl);
    return backendFetch(stopDynamicSimulationUrl, { method: 'put' });
}

export function fetchDynamicSimulationStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching dynamic simulation status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/status';
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

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/result/timeseries/metadata';
    console.debug(url);
    return backendFetchJson(url);
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

    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/dynamic-simulation/result/timeseries?${urlSearchParams}`;

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
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/result/timeline';
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

export function fetchDynamicSimulationModels(studyUuid, nodeUuid) {
    console.info(
        `Fetching dynamic simulation models on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/dynamic-simulation/models';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationProvider(studyUuid) {
    console.info('fetch dynamic simulation provider');
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSimulationProvider() {
    console.info('fetch default dynamic simulation provider');
    const url =
        PREFIX_STUDY_QUERIES + '/v1/dynamic-simulation-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSimulationProvider(studyUuid, newProvider) {
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

export function fetchDynamicSimulationParameters(studyUuid) {
    console.info(
        `Fetching dynamic simulation parameters on '${studyUuid}' ...`
    );
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/parameters';
    console.debug(url);
    const parametersPromise = backendFetchJson(url);

    const mappingsPromise = getDynamicMappings(studyUuid);

    return Promise.all([parametersPromise, mappingsPromise]).then(
        ([parameters, mappings]) => ({
            ...parameters,
            mappings,
        })
    );
}

export function updateDynamicSimulationParameters(studyUuid, newParams) {
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
