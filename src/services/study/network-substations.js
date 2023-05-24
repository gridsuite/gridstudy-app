/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';

export function getSubstationSingleLineDiagram(
    studyUuid,
    currentNodeUuid,
    substationId,
    useName,
    centerLabel,
    diagonalLabel,
    substationLayout,
    componentLibrary,
    language
) {
    console.info(
        `Getting url of substation diagram '${substationId}' of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams({
        useName: useName,
        centerLabel: centerLabel,
        diagonalLabel: diagonalLabel,
        topologicalColoring: true,
        substationLayout: substationLayout,
        ...(componentLibrary !== null && {
            componentLibrary: componentLibrary,
        }),
        language: language,
    });

    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkSubstations
    }/${encodeURIComponent(substationId)}/svg-and-metadata?${urlSearchParams}`;
}
