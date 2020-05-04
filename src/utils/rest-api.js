/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {store} from '../redux/store'

let PREFIX_CASE_QUERIES;
let PREFIX_STUDY_QUERIES;
if (process.env.REACT_APP_USE_AUTHENTICATION === "true") {
    PREFIX_CASE_QUERIES = process.env.REACT_APP_API_GATEWAY + "/case";
    PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + "/study";
} else {
    PREFIX_CASE_QUERIES = process.env.REACT_APP_API_CASE_SERVER;
    PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_STUDY_SERVER;
}

function getToken() {
    if (process.env.REACT_APP_USE_AUTHENTICATION === "true") {
        const state = store.getState();
        return state.user.id_token;
    }
}

function backendFetch(url, init) {
    if (process.env.REACT_APP_USE_AUTHENTICATION === "true") {
        init.headers === undefined ? init.headers = new Headers({'Authorization': 'Bearer ' + getToken()}) :
            init.headers.append('Authorization', 'Bearer ' + getToken());
    }
    return fetch(url, init);
}

export function fetchStudies() {
    console.info("Fetching studies...");
    const fetchStudiesUrl = PREFIX_STUDY_QUERIES + "/v1/studies";
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, {
        method: 'get',
    }).then(response => response.json());
}

export function fetchCases() {
    console.info("Fetching cases...");
    const fetchCasesUrl = PREFIX_CASE_QUERIES + "/v1/cases";
    console.debug(fetchCasesUrl);
    return backendFetch(fetchCasesUrl, {
        method: 'get',
    }).then(response => response.json());
}

export function getVoltageLevelSingleLineDiagram(studyName, voltageLevelId, useName, centerLabel, diagonalLabel, topologicalColoring) {
    console.info(`Getting url of voltage level diagram '${voltageLevelId}' of study '${studyName}'...`);
    return PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/network/voltage-levels/" + voltageLevelId + "/svg-and-metadata?useName=" + useName
        + "&centerLabel=" + centerLabel + "&diagonalLabel=" + diagonalLabel + "&topologicalColoring=" + topologicalColoring;
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl, {
        method: 'get',
    }).then(response => response.ok ?
        response.json() :
        response.json().then( error => Promise.reject(new Error(error.error))));
}

export function fetchSubstations(studyName) {
    console.info(`Fetching substations of study '${studyName}'...`);
    const fetchSubstationsUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/network-map/substations";
    console.debug(fetchSubstationsUrl);
    return backendFetch(fetchSubstationsUrl, {
        method: 'get',
    }).then(response => response.json());
}

export function fetchSubstationPositions(studyName) {
    console.info(`Fetching substation positions of study '${studyName}'...`);
    const fetchSubstationPositionsUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/geo-data/substations";
    console.debug(fetchSubstationPositionsUrl);
    return backendFetch(fetchSubstationPositionsUrl, {
        method: 'get',
    }).then(response => response.json());
}

export function fetchLines(studyName) {
    console.info(`Fetching lines of study '${studyName}'...`);
    const fetchLinesUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/network-map/lines";
    console.debug(fetchLinesUrl);
    return backendFetch(fetchLinesUrl, {
        method: 'get',
    }).then(response => response.json());
}

export function fetchLinePositions(studyName) {
    console.info(`Fetching line positions of study '${studyName}'...`);
    const fetchLinePositionsUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/geo-data/lines";
    console.debug(fetchLinePositionsUrl);
    return backendFetch(fetchLinePositionsUrl, {
        method: 'get',
    }).then(response => response.json());
}

export function createStudy(caseExist, studyName, studyDescription, caseName, selectedFile) {
    console.info("Creating a new study...");
    if (caseExist) {
        const createStudyWithExistingCaseUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName +"/cases/" + caseName +"?description=" + studyDescription;
        console.debug(createStudyWithExistingCaseUrl);
        return backendFetch(createStudyWithExistingCaseUrl, {
            method : 'post',
        });
    } else {
        const createStudyWithNewCaseUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "?description=" + studyDescription;
        const formData = new FormData();
        formData.append('caseFile', selectedFile);
        console.debug(createStudyWithNewCaseUrl);
        return backendFetch(createStudyWithNewCaseUrl, {
            method : 'post',
            body : formData
        })
    }
}

export function deleteStudy(studyName) {
    console.info("Deleting study" + studyName + " ...");
    const deleteStudyUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName;
    console.debug(deleteStudyUrl);
    return backendFetch(deleteStudyUrl,{
        method:'delete'
    });
}

export function renameStudy(studyName, newStudyName) {
    console.info("Renaming study " + studyName);
    const renameStudiesUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/rename";
    console.debug(renameStudiesUrl);
    return backendFetch(renameStudiesUrl, {
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({newStudyName: newStudyName})
    }).then(response => response.json());
}

