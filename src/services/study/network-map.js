/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';
import {
    backendFetchJson,
    getRequestParamFromList,
} from '../../utils/rest-api';

export function fetchEquipmentsIds(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching equipments ids '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );
    const urlSearchParams = new URLSearchParams(substationParams);

    urlSearchParams.append('equipmentType', equipmentType);

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentsUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}/equipments-ids?${urlSearchParams}`;

    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    equipmentPath,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching equipments '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );

    const urlSearchParams = new URLSearchParams(substationParams);

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentsUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}/${equipmentPath}?${urlSearchParams}`;

    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchVoltageLevelEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    voltageLevelId,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching equipments of study '${studyUuid}' and node '${currentNodeUuid}' and voltage level '${voltageLevelId}' with substations ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );
    const urlSearchParams = new URLSearchParams(substationParams);

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentsBaseUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}`;

    const fetchEquipmentsUrl = `${fetchEquipmentsBaseUrl}/voltage-level-equipments/${encodeURIComponent(
        voltageLevelId
    )}?${urlSearchParams}`;

    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipmentInfos(
    studyUuid,
    currentNodeUuid,
    equipmentPath,
    equipmentId,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching specific equipment '${equipmentId}' of type '${equipmentPath}' of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentInfosUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}/${equipmentPath}/${encodeURIComponent(
        equipmentId
    )}?${urlSearchParams}`;

    console.debug(fetchEquipmentInfosUrl);
    return backendFetchJson(fetchEquipmentInfosUrl);
}

export function fetchVoltageLevelsEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Voltage-levels-equipments',
        'voltage-levels-equipments',
        true
    );
}

export function fetchAllEquipments(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'All',
        'all'
    );
}

export function fetchLineOrTransformer(
    studyUuid,
    currentNodeUuid,
    equipmentId
) {
    return fetchEquipmentInfos(
        studyUuid,
        currentNodeUuid,
        'branch-or-3wt',
        equipmentId,
        true
    );
}
