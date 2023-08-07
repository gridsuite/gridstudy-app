/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const PREFIX_STUDY_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/study';

export const getStudyUrl = (studyUuid) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}`;

export const getStudyUrlWithNodeUuid = (studyUuid, nodeUuid) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(
        studyUuid
    )}/nodes/${encodeURIComponent(nodeUuid)}`;
