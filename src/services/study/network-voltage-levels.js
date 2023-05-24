/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';

import { backendFetchJson } from '../../utils/rest-api';

export function getVoltageLevelSingleLineDiagram(
    studyUuid,
    currentNodeUuid,
    voltageLevelId,
    useName,
    centerLabel,
    diagonalLabel,
    componentLibrary,
    sldDisplayMode,
    language
) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams({
        useName: useName,
        centerLabel: centerLabel,
        diagonalLabel: diagonalLabel,
        topologicalColoring: true,
        ...(componentLibrary !== null && {
            componentLibrary: componentLibrary,
        }),
        sldDisplayMode: sldDisplayMode,
        language: language,
    });

    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkVoltageLevels
    }/${encodeURIComponent(
        voltageLevelId
    )}/svg-and-metadata?${urlSearchParams}`;
}

export function fetchBusesForVoltageLevel(
    studyUuid,
    currentNodeUuid,
    voltageLevelId
) {
    console.info(
        `Fetching buses of study '${studyUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );

    const fetchBusesUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkVoltageLevels}/${encodeURIComponent(
        voltageLevelId
    )}/buses`;

    console.debug(fetchBusesUrl);
    return backendFetchJson(fetchBusesUrl);
}

export function fetchBusbarSectionsForVoltageLevel(
    studyUuid,
    currentNodeUuid,
    voltageLevelId
) {
    console.info(
        `Fetching busbar sections of study '${studyUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );

    const fetchBusbarSectionsUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkVoltageLevels}/${encodeURIComponent(
        voltageLevelId
    )}/busbar-sections`;

    console.debug(fetchBusbarSectionsUrl);
    return backendFetchJson(fetchBusbarSectionsUrl);
}
