/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from '../../utils/rest-api';

export const PREFIX_STUDY_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/study`;
const API_VERSION = 'v1';

export const STUDY_PATHS = {
    build: '/build',
    case: '/case',
    contingencyCount: '/contingency-count',
    dynamicSimulation: '/dynamic-simulation',
    dynamicSimulationDefaultProvider: '/dynamic-simulation-default-provider',
    exportNetwork: '/export-network',
    exportNetworkFormats: '/export-network-formats',
    geoData: '/geo-data',
    loadflow: '/loadflow',
    loadflowDefaultProvider: 'loadflow-default-provider',
    networkAreaDiagram: '/network-area-diagram',
    networkElements: '/network/elements',
    networkMap: '/network-map',
    networkModification: '/network-modification/',
    networkModifications: '/network-modifications/',
    nodes: '/nodes',
    networkVoltageLevels: '/network/voltage-levels',
    networkSubstations: '/network/substations',
    overloadedLines: '/overloaded-lines',
    report: '/report',
    securityAnalysis: '/security-analysis',
    securityAnalysisDefaultProvider: '/security-analysis-default-provider',
    sensitivityAnalysis: '/sensitivity-analysis',
    sensitivityAnalysisDefaultProvider:
        '/sensitivity-analysis-default-provider',
    shortCircuitAnalysis: '/short-circuit-analysis',
    shortcircuit: '/shortcircuit',
    subtree: '/subtree',
    svgComponentLibraries: '/svg-component-libraries',
    tree: '/tree',
};

export function getStudyUrl(studyUuid) {
    if (studyUuid) {
        const studyUuidEncodedURIComponent = encodeURIComponent(studyUuid);
        return `${PREFIX_STUDY_QUERIES}/${API_VERSION}/studies/${studyUuidEncodedURIComponent}`;
    }

    return `${PREFIX_STUDY_QUERIES}/${API_VERSION}`;
}

export function getStudyUrlWithNodeUuid(studyUuid, nodeUuid) {
    return `${PREFIX_STUDY_QUERIES}/${API_VERSION}/studies/${encodeURIComponent(
        studyUuid
    )}/nodes/${encodeURIComponent(nodeUuid)}`;
}

export function fetchStudy(studyUuid) {
    console.info(`Fetching study '${studyUuid}' ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetchJson(fetchStudiesUrl);
}

export function fetchStudyExists(studyUuid) {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
}
