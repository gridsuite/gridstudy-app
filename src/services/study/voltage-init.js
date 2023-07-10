// --- Voltage init API - BEGIN
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
} from '../../utils/rest-api';
import { getStudyUrl, getStudyUrlWithNodeUuid } from './index';

export function startVoltageInit(studyUuid, currentNodeUuid) {
    console.info(
        `Running voltage init on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startVoltageInitUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/run';
    console.debug(startVoltageInitUrl);
    return backendFetch(startVoltageInitUrl, { method: 'put' });
}

export function stopVoltageInit(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping voltage init on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopVoltageInitUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/stop';
    console.debug(stopVoltageInitUrl);
    return backendFetch(stopVoltageInitUrl, { method: 'put' });
}

export function fetchVoltageInitStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching voltage init status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchVoltageInitResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching voltage init result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/result';
    console.debug(url);
    return backendFetchJson(url);
}

export function updateVoltageInitParameters(studyUuid, newParams) {
    console.info('set voltage init parameters');
    const url = getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(url);

    console.info('newParams in rest API', newParams);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function getVoltageInitParameters(studyUuid) {
    console.info('get voltage init parameters');
    const getVoltageInitParams =
        getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(getVoltageInitParams);
    return backendFetchJson(getVoltageInitParams);
}
