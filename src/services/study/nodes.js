/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, STUDY_PATHS } from './index';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
} from '../../utils/rest-api';

export function searchEquipmentsInfos(
    studyUuid,
    nodeUuid,
    searchTerm,
    getUseNameParameterKey,
    inUpstreamBuiltParentNode = true,
    equipmentType
) {
    console.info(
        "Fetching equipments infos matching with '%s' term ... ",
        searchTerm
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('userInput', searchTerm);
    urlSearchParams.append('fieldSelector', getUseNameParameterKey());

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    if (equipmentType !== undefined) {
        urlSearchParams.append('equipmentType', equipmentType);
    }

    const searchEquipmentsInfoUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.nodes
    }/${encodeURIComponent(nodeUuid)}/search?${urlSearchParams}`;

    return backendFetchJson(searchEquipmentsInfoUrl);
}

export function deleteModifications(studyUuid, nodeUuid, modificationUuids) {
    const modificationDeleteUrl = `${getStudyUrl()}/studies/${encodeURIComponent(
        studyUuid
    )}${STUDY_PATHS.nodes}/${encodeURIComponent(
        nodeUuid
    )}/network-modifications?uuids=${encodeURIComponent(modificationUuids)}`;

    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'delete',
    });
}

export function isNodeExists(studyUuid, nodeName) {
    const urlSearchParams = new URLSearchParams({ nodeName: nodeName });

    const existsNodeUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.nodes
    }?${urlSearchParams}`;

    console.debug(existsNodeUrl);
    return backendFetch(existsNodeUrl, { method: 'head' });
}

export function getUniqueNodeName(studyUuid) {
    const uniqueNodeNameUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.nodes
    }/nextUniqueName`;
    console.debug(uniqueNodeNameUrl);
    return backendFetchText(uniqueNodeNameUrl);
}

export function copyOrMoveModifications(
    studyUuid,
    targetNodeId,
    modificationToCutUuidList,
    copyInfos
) {
    console.info(`${copyInfos.copyType} modifications`);

    const urlSearchParams = new URLSearchParams({
        action: copyInfos.copyType,
        originNodeUuid: copyInfos.originNodeUuid ?? '',
    });

    const copyOrMoveModificationUrl = `${getStudyUrl()}/studies/${encodeURIComponent(
        studyUuid
    )}${STUDY_PATHS.nodes}/${encodeURIComponent(
        targetNodeId
    )}?${urlSearchParams}`;

    return backendFetch(copyOrMoveModificationUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(modificationToCutUuidList),
    });
}

export function fetchNetworkModifications(studyUuid, nodeUuid) {
    console.info('Fetching network modifications for nodeUuid : ', nodeUuid);
    const modificationsGetUrl = `${getStudyUrl()}/studies/${encodeURIComponent(
        studyUuid
    )}${STUDY_PATHS.nodes}/${encodeURIComponent(
        nodeUuid
    )}/network-modifications`;

    console.debug(modificationsGetUrl);
    return backendFetchJson(modificationsGetUrl);
}
