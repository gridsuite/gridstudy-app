/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
} from '../../utils/rest-api';

export function startSensitivityAnalysis(
    studyUuid,
    currentNodeUuid,
    sensiConfiguration
) {
    console.info(
        `Running sensi on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/run`;

    console.debug(url);

    const body = JSON.stringify(sensiConfiguration);

    return backendFetch(url, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function stopSensitivityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping sensitivity analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const stopSensitivityAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.sensitivityAnalysis}/stop`;
    console.debug(stopSensitivityAnalysisUrl);
    return backendFetch(stopSensitivityAnalysisUrl, { method: 'put' });
}

export function fetchSensitivityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching sensitivity analysis status on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchSensitivityAnalysisResult(
    studyUuid,
    currentNodeUuid,
    selector
) {
    console.info(
        `Fetching sensitivity analysis on ${studyUuid} and node ${currentNodeUuid}  ...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/result?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisProvider(studyUuid) {
    console.info('fetch sensitivity analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateSensitivityAnalysisProvider(studyUuid, newProvider) {
    console.info('update sensitivity analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/provider`;
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

export function fetchDefaultSensitivityAnalysisProvider() {
    console.info('fetch default sensitivity analysis provider');
    const url = `${getStudyUrl()}${
        STUDY_PATHS.sensitivityAnalysisDefaultProvider
    }`;
    console.debug(url);
    return backendFetchText(url);
}
