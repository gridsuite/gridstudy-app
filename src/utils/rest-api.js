/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export function fetchStudies() {
    console.info("Fetching studies...");
    let studiesUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies"

    console.log(studiesUrl)
    return fetch(studiesUrl)
        .then(response => response.json());
}

export function fetchCases() {
    console.info("Fetching cases...");
    let casesUrl = process.env.REACT_APP_API_CASE_SERVER + "/v1/cases"
    console.log(casesUrl)
    return fetch(casesUrl)
        .then(response => response.json());
}

export function fetchVoltageLevelDiagram(studyName, voltageLevelId) {
    console.info(`Fetching voltage level diagram '${voltageLevelId}' of study '${studyName}'...`);
    const voltageLevelUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/network/voltage-levels/" + voltageLevelId + "/svg"
    console.log(voltageLevelUrl)
    return fetch(voltageLevelUrl)
        .then(response => response.text());
}

export function fetchSubstations(studyName) {
    console.info(`Fetching substations of study '${studyName}'...`);
    const substationsUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/network-map/substations"
    console.log(substationsUrl)

    return fetch(substationsUrl)
        .then(response => response.json());
}

export function fetchSubstationPositions(studyName) {
    const substationsUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/geo-data/substations"
    console.info(`Fetching substation positions of study '${studyName}'...`);
    return fetch(substationsUrl)
        .then(response => response.json());
}

export function fetchLines(studyName) {
    console.info(`Fetching lines of study '${studyName}'...`);
    const linesUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/network-map/lines"
    return fetch(linesUrl)
        .then(response => response.json());
}

export function fetchLinePositions(studyName) {
    console.info(`Fetching line positions of study '${studyName}'...`);
    const linesUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/geo-data/lines"
    return fetch(linesUrl)
        .then(response => response.json());
}

export function createStudy(caseExist, studyName, studyDescription, caseName, caseData) {
    console.info("Creating a new study...");
    let createStudyWithExistingCase = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName +"/cases/" + caseName +"?description=" + studyDescription;
    let createStudyWithNewCase = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "?description=" + studyDescription;
    console.log(createStudyWithExistingCase);
    console.log(createStudyWithNewCase);

    if (caseExist) {
        console.log("case exist")
        console.log("studyName: " + studyName)
        console.log("studyDescription: " + studyDescription)
        console.log("caseName: " + caseName)
        return fetch(createStudyWithExistingCase, {method : 'post'});

    } else {
        console.log("case doesn't exist")
        console.log("studyName: " + studyName)
        console.log("studyDescription: " + studyDescription)
        console.log("caseData: " + caseData)
        return fetch(createStudyWithExistingCase, {
            method : 'post',
            headers: {
                'Content-Type': 'multipart/form-data',
                mode: 'no-cors',
                body: JSON.stringify(caseData)
            }
        });
    }
}
