/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from '../../utils/rest-api';
import { getStudyUrl } from './index';

export function copySubtree(
    sourceStudyUuid,
    targetStudyUuid,
    nodeToCopyUuid,
    referenceNodeUuid
) {
    const nodeCopyUrl =
        getStudyUrl(targetStudyUuid) +
        '/tree/subtrees?subtreeToCopyParentNodeUuid=' +
        nodeToCopyUuid +
        '&referenceNodeUuid=' +
        referenceNodeUuid +
        '&sourceStudyUuid=' +
        sourceStudyUuid;
    console.debug(nodeCopyUrl);
    return backendFetch(nodeCopyUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function cutSubtree(targetStudyId, nodeToCopyUuid, referenceNodeUuid) {
    const nodeCopyUrl =
        getStudyUrl(targetStudyId) +
        '/tree/subtrees?subtreeToCutParentNodeUuid=' +
        nodeToCopyUuid +
        '&referenceNodeUuid=' +
        referenceNodeUuid;
    console.debug(nodeCopyUrl);
    return backendFetch(nodeCopyUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function cutTreeNode(
    studyUuid,
    nodeToCutUuid,
    referenceNodeUuid,
    insertMode
) {
    const nodeCutUrl =
        getStudyUrl(studyUuid) +
        '/tree/nodes?insertMode=' +
        insertMode +
        '&nodeToCutUuid=' +
        nodeToCutUuid +
        '&referenceNodeUuid=' +
        referenceNodeUuid;
    console.debug(nodeCutUrl);
    return backendFetch(nodeCutUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function copyTreeNode(
    sourceStudyUuid,
    targetStudyId,
    nodeToCopyUuid,
    referenceNodeUuid,
    insertMode
) {
    const nodeCopyUrl =
        getStudyUrl(targetStudyId) +
        '/tree/nodes?insertMode=' +
        insertMode +
        '&nodeToCopyUuid=' +
        nodeToCopyUuid +
        '&referenceNodeUuid=' +
        referenceNodeUuid +
        '&sourceStudyUuid=' +
        sourceStudyUuid;
    console.debug(nodeCopyUrl);
    return backendFetch(nodeCopyUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function createTreeNode(studyUuid, parentId, insertMode, node) {
    const nodeCreationUrl =
        getStudyUrl(studyUuid) +
        '/tree/nodes/' +
        encodeURIComponent(parentId) +
        '?mode=' +
        insertMode;
    console.debug('%s with body: %s', nodeCreationUrl, node);
    return backendFetch(nodeCreationUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(node),
    });
}

export function deleteTreeNode(studyUuid, nodeId) {
    console.info('Deleting tree node : ', nodeId);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeId);
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    });
}

export function deleteSubtree(studyUuid, parentNodeId) {
    console.info('Deleting node subtree : ', parentNodeId);
    const url =
        getStudyUrl(studyUuid) +
        '/tree/nodes/' +
        encodeURIComponent(parentNodeId) +
        '?deleteChildren=true';
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    });
}

export function updateTreeNode(studyUuid, node) {
    const nodeUpdateUrl = getStudyUrl(studyUuid) + '/tree/nodes/';
    console.debug(nodeUpdateUrl);
    return backendFetch(nodeUpdateUrl, {
        method: 'put',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(node),
    });
}

export function fetchNetworkModificationTreeNode(studyUuid, nodeUuid) {
    console.info('Fetching network modification tree node : ', nodeUuid);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeUuid);
    console.debug(url);
    return backendFetchJson(url);
}
