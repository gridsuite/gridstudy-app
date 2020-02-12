/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Routes
const studiesUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies"

export function fetchStudies() {
    console.info("Fetching studies...");
    console.log(studiesUrl)
    return fetch(studiesUrl)
        .then(response => response.json());
}

export function createStudy(caseExist, studyName, studyDescription, caseName, caseData) {
    console.info("Creating a new study...");
    const createStudyWithExistingCase = process.env.REACT_APP_API_STUDY_SERVER + "/v1/" + studyName +"/cases/" + caseName +"?description=" + studyDescription;
    console.log(createStudyWithExistingCase);

    if (caseExist) {
        console.log("case exist")
        console.log("studyName: " + studyName)
        console.log("studyDescription: " + studyDescription)
        console.log("caseName: " + caseName)

    } else {
        console.log("case doesn't exist")
        console.log("studyName: " + studyName)
        console.log("studyDescription: " + studyDescription)
        console.log("caseData: " + caseData)
    }
    return true;
}

export function fetchVoltageLevelDiagram(studyName, voltageLevelId) {
    console.info(`Fetching voltage level diagram '${voltageLevelId}' of study '${studyName}'...`);
    return fetch('sld.svg')
        .then(response => response.text());
}

export function fetchSubstations(studyName) {
    console.info(`Fetching substations of study '${studyName}'...`);
    return fetch('substations.json')
        .then(response => response.json());
}

export function fetchSubstationPositions(studyName) {
    console.info(`Fetching substation positions of study '${studyName}'...`);
    return fetch('substation-positions.json')
        .then(response => response.json());
}

export function fetchLines(studyName) {
    console.info(`Fetching lines of study '${studyName}'...`);
    return fetch('lines.json')
        .then(response => response.json());
}

export function fetchLinePositions(studyName) {
    console.info(`Fetching line positions of study '${studyName}'...`);
    return fetch('line-positions.json')
        .then(response => response.json());
}
