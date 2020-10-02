/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';

let PREFIX_CASE_QUERIES = process.env.REACT_APP_API_GATEWAY + '/case';
let PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + '/study';
let PREFIX_NOTIFICATION_WS = process.env.REACT_APP_WS_GATEWAY + '/notification';

function getToken() {
    const state = store.getState();
    return state.user.id_token;
}

function backendFetch(url, init) {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError(
            'Argument 2 of backendFetch is not an object' + typeof init
        );
    }
    const initCopy = Object.assign({}, init);
    initCopy.headers = new Headers(initCopy.headers || {});
    initCopy.headers.append('Authorization', 'Bearer ' + getToken());

    return fetch(url, initCopy);
}

export function fetchStudies() {
    console.info('Fetching studies...');
    const fetchStudiesUrl = PREFIX_STUDY_QUERIES + '/v1/studies';
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl).then((response) => response.json());
}

export function fetchStudy(studyName, userId) {
    console.info('Fetching studies...');
    const fetchStudiesUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        studyName;
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl).then((response) => response.json());
}

export function fetchCases() {
    console.info('Fetching cases...');
    const fetchCasesUrl = PREFIX_CASE_QUERIES + '/v1/cases';
    console.debug(fetchCasesUrl);
    return backendFetch(fetchCasesUrl).then((response) => response.json());
}

export function getVoltageLevelSingleLineDiagram(
    studyName,
    userId,
    voltageLevelId,
    useName,
    centerLabel,
    diagonalLabel
) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${studyName}' of user '${userId}'...`
    );
    return (
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/svg-and-metadata?' +
        new URLSearchParams({
            useName: useName,
            centerLabel: centerLabel,
            diagonalLabel: diagonalLabel,
            topologicalColoring: true,
        }).toString()
    );
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) =>
        response.ok
            ? response.json()
            : response
                  .json()
                  .then((error) => Promise.reject(new Error(error.error)))
    );
}

export function fetchSubstations(studyName, userId) {
    console.info(
        `Fetching substations of study '${studyName}' of user '${userId}'...`
    );
    const fetchSubstationsUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/network-map/substations';
    console.debug(fetchSubstationsUrl);
    return backendFetch(fetchSubstationsUrl).then((response) =>
        response.json()
    );
}

export function fetchSubstationPositions(studyName, userId) {
    console.info(`Fetching substation positions of study '${studyName}'...`);
    const fetchSubstationPositionsUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/geo-data/substations';
    console.debug(fetchSubstationPositionsUrl);
    return backendFetch(fetchSubstationPositionsUrl).then((response) =>
        response.json()
    );
}

export function fetchLines(studyName, userId) {
    console.info(`Fetching lines of study '${studyName}'...`);
    const fetchLinesUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/network-map/lines';
    console.debug(fetchLinesUrl);
    return backendFetch(fetchLinesUrl).then((response) => response.json());
}

export function fetchTwoWindingsTransformers(studyName, userId) {
    console.info(`Fetching 2 windings transformers of study '${studyName}'...`);
    const fetchTwoWindingsTransformersUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/network-map/2-windings-transformers';
    console.debug(fetchTwoWindingsTransformersUrl);
    return backendFetch(fetchTwoWindingsTransformersUrl).then((response) =>
        response.json()
    );
}

export function fetchThreeWindingsTransformers(studyName, userId) {
    console.info(`Fetching 3 windings transformers of study '${studyName}'...`);
    const fetchThreeWindingsTransformersUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/network-map/3-windings-transformers';
    console.debug(fetchThreeWindingsTransformersUrl);
    return backendFetch(fetchThreeWindingsTransformersUrl).then((response) =>
        response.json()
    );
}

export function fetchGenerators(studyName, userId) {
    console.info(`Fetching generators of study '${studyName}'...`);
    const fetchGeneratorsUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/network-map/generators';
    console.debug(fetchGeneratorsUrl);
    return backendFetch(fetchGeneratorsUrl).then((response) => response.json());
}

export function fetchLinePositions(studyName, userId) {
    console.info(`Fetching line positions of study '${studyName}'...`);
    const fetchLinePositionsUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/geo-data/lines';
    console.debug(fetchLinePositionsUrl);
    return backendFetch(fetchLinePositionsUrl).then((response) =>
        response.json()
    );
}

export function studyExists(studyName, userId) {
    const studyExistsUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/exists';
    console.debug(studyExistsUrl);
    return backendFetch(studyExistsUrl, { method: 'get' }).then((response) => {
        return response.json();
    });
}

export function createStudy(
    caseExist,
    studyName,
    studyDescription,
    caseName,
    selectedFile,
    isPrivateStudy
) {
    console.info('Creating a new study...');
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('description', studyDescription);
    urlSearchParams.append('isPrivate', isPrivateStudy);

    if (caseExist) {
        const createStudyWithExistingCaseUrl =
            PREFIX_STUDY_QUERIES +
            '/v1/studies/' +
            encodeURIComponent(studyName) +
            '/cases/' +
            encodeURIComponent(caseName) +
            '?' +
            urlSearchParams.toString();
        console.debug(createStudyWithExistingCaseUrl);
        return backendFetch(createStudyWithExistingCaseUrl, {
            method: 'post',
        });
    } else {
        const createStudyWithNewCaseUrl =
            PREFIX_STUDY_QUERIES +
            '/v1/studies/' +
            encodeURIComponent(studyName) +
            '?' +
            urlSearchParams.toString();
        const formData = new FormData();
        formData.append('caseFile', selectedFile);
        console.debug(createStudyWithNewCaseUrl);

        return backendFetch(createStudyWithNewCaseUrl, {
            method: 'post',
            body: formData,
        });
    }
}

export function deleteStudy(studyName, userId) {
    console.info(
        'Deleting study ' + studyName + 'from user ' + userId + ' ...'
    );
    const deleteStudyUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName);
    console.debug(deleteStudyUrl);
    return backendFetch(deleteStudyUrl, {
        method: 'delete',
    });
}

export function updateSwitchState(studyName, userId, switchId, open) {
    console.info('updating switch ' + switchId + ' ...');
    const updateSwitchUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/network-modification/switches/' +
        encodeURIComponent(switchId) +
        '?' +
        new URLSearchParams({ open: open }).toString();
    console.debug(updateSwitchUrl);
    return backendFetch(updateSwitchUrl, { method: 'put' });
}

export function renameStudy(studyName, userId, newStudyName) {
    console.info('Renaming study ' + studyName);
    const renameStudiesUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/rename';

    console.debug(renameStudiesUrl);
    return backendFetch(renameStudiesUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStudyName: newStudyName }),
    }).then((response) => response.json());
}

export function startLoadFlow(studyName, userId) {
    console.info('Running loadflow on ' + studyName + '...');
    const startLoadFlowUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/loadflow/run';
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function connectNotificationsWebsocket(studyName) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const wsadress =
        wsbase +
        PREFIX_NOTIFICATION_WS +
        '/notify?studyName=' +
        encodeURIComponent(studyName);
    let wsaddressWithToken;
    wsaddressWithToken = wsadress + '&access_token=' + getToken();

    const rws = new ReconnectingWebSocket(wsaddressWithToken);
    // don't log the token, it's private
    rws.onopen = function (event) {
        console.info('Connected Websocket ' + wsadress + ' ...');
    };
    return rws;
}

export function getAvailableExportFormats() {
    console.info('get export formats');
    const getExportFormatsUrl =
        PREFIX_STUDY_QUERIES + '/v1/export-network-formats';
    console.debug(getExportFormatsUrl);
    return backendFetch(getExportFormatsUrl, {
        method: 'get',
    }).then((response) => response.json());
}

function getUrlWithToken(baseUrl) {
    return baseUrl + '?access_token=' + getToken();
}

export function getExportUrl(userId, studyName, exportFormat) {
    const url =
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName) +
        '/' +
        '/export-network/' +
        exportFormat;
    return getUrlWithToken(url);
}
