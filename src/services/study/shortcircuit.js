/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
} from '../../utils/rest-api';

export function startShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Running short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startShortCircuitAnanysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.shortcircuit}/run`;

    console.debug(startShortCircuitAnanysisUrl);
    return backendFetch(startShortCircuitAnanysisUrl, { method: 'put' });
}

export function stopShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopShortCircuitAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.shortcircuit}/stop`;
    console.debug(stopShortCircuitAnalysisUrl);
    return backendFetch(stopShortCircuitAnalysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching short circuit analysis status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.shortcircuit
    }/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchShortCircuitAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.shortcircuit
    }/result`;
    console.debug(url);
    return backendFetchJson(url);
}
