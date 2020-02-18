/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function fetchStudies() {
    console.info("Fetching studies...");
    let fetchStudiesUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies"
    console.log(fetchStudiesUrl)
    return fetch(fetchStudiesUrl)
        .then(response => response.json());
}

export function fetchCases() {
    console.info("Fetching cases...");
    let fetchCasesUrl = process.env.REACT_APP_API_CASE_SERVER + "/v1/cases"
    console.log(fetchCasesUrl)
    return fetch(fetchCasesUrl)
        .then(response => response.json());
}

export function fetchVoltageLevelDiagram(studyName, voltageLevelId) {
    console.info(`Fetching voltage level diagram '${voltageLevelId}' of study '${studyName}'...`);
    const fetchVoltageLevelDiagramUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/network/voltage-levels/" + voltageLevelId + "/svg"
    console.log(fetchVoltageLevelDiagramUrl)
    return fetch(fetchVoltageLevelDiagramUrl)
        .then(response => response.text());
}

export function fetchSubstations(studyName) {
    console.info(`Fetching substations of study '${studyName}'...`);
    const fetchSubstationsUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/network-map/substations"
    console.log(fetchSubstationsUrl)
    return fetch(fetchSubstationsUrl)
        .then(response => response.json());
}

export function fetchSubstationPositions(studyName) {
    console.info(`Fetching substation positions of study '${studyName}'...`);
    const fetchSubstationPositionsUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/geo-data/substations"
    console.log(fetchSubstationPositionsUrl)
    return fetch(fetchSubstationPositionsUrl)
        .then(response => response.json());
}

export function fetchLines(studyName) {
    console.info(`Fetching lines of study '${studyName}'...`);
    const fetchLinesUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/network-map/lines"
    console.log(fetchLinesUrl)
    return fetch(fetchLinesUrl)
        .then(response => response.json());
}

export function fetchLinePositions(studyName) {
    console.info(`Fetching line positions of study '${studyName}'...`);
    const fetchLinePositionsUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "/geo-data/lines"
    console.log(fetchLinePositionsUrl)
    return fetch(fetchLinePositionsUrl)
        .then(response => response.json());
}

export function createStudy(caseExist, studyName, studyDescription, caseName, caseData, selectedFile) {
    console.info("Creating a new study...");
    const createStudyWithExistingCaseUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName +"/cases/" + caseName +"?description=" + studyDescription;
    const createStudyWithNewCaseUrl = process.env.REACT_APP_API_STUDY_SERVER + "/v1/studies/" + studyName + "?description=" + studyDescription;

    if (caseExist) {
        console.log("case exist")
        console.log("studyName: " + studyName)
        console.log("studyDescription: " + studyDescription)
        console.log("caseName: " + caseName)
        console.log(createStudyWithExistingCaseUrl);
        return fetch(createStudyWithExistingCaseUrl, {method : 'post'});

    } else {
        const formData = new FormData();
        formData.append('caseFile', selectedFile);
        console.log("selectedFile: " + selectedFile)

        console.log("case doesn't exist")
        console.log("studyName: " + studyName)
        console.log("studyDescription: " + studyDescription)
        //console.log("caseData: " + caseData)
        console.log(createStudyWithNewCaseUrl);
        return fetch(createStudyWithNewCaseUrl, {
            method : 'post',
            body : formData
        }).then(res => {
                      if(res.ok) {
                          console.log(res.data);
                          alert("File uploaded successfully.")
                      } else {
                            console.log("fuckkkk!!")
                            console.log(res)
                      }
                  });
                  debugger;
    }
}
