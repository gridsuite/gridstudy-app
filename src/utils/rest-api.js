/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

let PREFIX_CASE_QUERIES = null;
let PREFIX_STUDY_QUERIES = null;
if (process.env.REACT_APP_USE_AUTHENTICATION === "true") {
    PREFIX_CASE_QUERIES = process.env.REACT_APP_API_GATEWAY + "/case";
    PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + "/study";
} else {
    PREFIX_CASE_QUERIES = process.env.REACT_APP_API_CASE_SERVER;
    PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_STUDY_SERVER;
}

export function fetchStudies(token) {
    console.info("Fetching studies...");
    const fetchStudiesUrl = PREFIX_STUDY_QUERIES + "/v1/studies";
    console.debug(fetchStudiesUrl);
    return fetch(fetchStudiesUrl, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer '+ token,
        })
    }).then(response => response.json());
}

export function fetchCases(token) {
    console.info("Fetching cases...");
    const fetchCasesUrl = PREFIX_CASE_QUERIES + "/v1/cases";
    console.debug(fetchCasesUrl);
    return fetch(fetchCasesUrl, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer '+ token,
        })
    }).then(response => response.json());
}

export function getVoltageLevelSingleLineDiagram(studyName, voltageLevelId, useName, centerLabel, diagonalLabel) {
    console.info(`Getting url of voltage level diagram '${voltageLevelId}' of study '${studyName}'...`);
    return PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/network/voltage-levels/" + voltageLevelId + "/svg-and-metadata?useName=" + useName
        + "&centerLabel=" + centerLabel + "&diagonalLabel=" + diagonalLabel;
}

export function fetchSvg(svgUrl, token) {
    console.debug(svgUrl);
    return fetch(svgUrl, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer '+ token,
        })
    }).then(response => response.ok ?
                            response.json() :
                            response.json().then( error => Promise.reject(new Error(error.error))));
}

export function fetchSubstations(studyName, token) {
    console.info(`Fetching substations of study '${studyName}'...`);
    const fetchSubstationsUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/network-map/substations";
    console.debug(fetchSubstationsUrl);
    return fetch(fetchSubstationsUrl, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer '+ token,
        })
    }).then(response => response.json());
}

export function fetchSubstationPositions(studyName, token) {
    console.info(`Fetching substation positions of study '${studyName}'...`);
    const fetchSubstationPositionsUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/geo-data/substations";
    console.debug(fetchSubstationPositionsUrl);
    return fetch(fetchSubstationPositionsUrl, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    }).then(response => response.json());
}

export function fetchLines(studyName, token) {
    console.info(`Fetching lines of study '${studyName}'...`);
    const fetchLinesUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/network-map/lines";
    console.debug(fetchLinesUrl);
    return fetch(fetchLinesUrl, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    }).then(response => response.json());
}

export function fetchLinePositions(studyName, token) {
    console.info(`Fetching line positions of study '${studyName}'...`);
    const fetchLinePositionsUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "/geo-data/lines";
    console.debug(fetchLinePositionsUrl);
    return fetch(fetchLinePositionsUrl, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    }).then(response => response.json());
}

export function createStudy(caseExist, studyName, studyDescription, caseName, selectedFile, token) {
    console.info("Creating a new study...");
    if (caseExist) {
        const createStudyWithExistingCaseUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName +"/cases/" + caseName +"?description=" + studyDescription;
        console.debug(createStudyWithExistingCaseUrl);
        return fetch(createStudyWithExistingCaseUrl, {
            method : 'post',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
            })
        });
    } else {
        const createStudyWithNewCaseUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName + "?description=" + studyDescription;
        const formData = new FormData();
        formData.append('caseFile', selectedFile);
        console.debug(createStudyWithNewCaseUrl);
        return fetch(createStudyWithNewCaseUrl, {
            method : 'post',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
            }),
            body : formData
        })
    }
}

export function deleteStudy(studyName, token) {
    console.info("Deleting study" + studyName + " ...");
    const deleteStudyUrl = PREFIX_STUDY_QUERIES + "/v1/studies/" + studyName;
    console.debug(deleteStudyUrl);
    return fetch(deleteStudyUrl,{
        method:'delete',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    });
}

