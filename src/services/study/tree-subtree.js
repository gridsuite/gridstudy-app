/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl } from './index';
import { backendFetch, backendFetchJson } from '../utils';

export function copySubtree(sourceStudyUuid, targetStudyUuid, nodeToCopyUuid, referenceNodeUuid) {
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

export function cutTreeNode(studyUuid, nodeToCutUuid, referenceNodeUuid, insertMode) {
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

export function copyTreeNode(sourceStudyUuid, targetStudyId, nodeToCopyUuid, referenceNodeUuid, insertMode) {
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
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(parentId) + '?mode=' + insertMode;
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

export function stashTreeNode(studyUuid, nodeId) {
    console.info('Stash tree node : ', nodeId);
    const url = getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeId) + '/stash';
    console.debug(url);
    return backendFetch(url, {
        method: 'post',
    });
}

export function stashSubtree(studyUuid, parentNodeId) {
    console.info('stash node subtree : ', parentNodeId);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(parentNodeId) + '/stash?stashChildren=true';
    console.debug(url);
    return backendFetch(url, {
        method: 'post',
    });
}

export function updateTreeNode(studyUuid, node) {
    const nodeUpdateUrl = getStudyUrl(studyUuid) + '/tree/nodes';
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

export function updateNodesColumnPositions(studyUuid, parentNodeId, nodes) {
    const nodeUpdateUrl = getStudyUrl(studyUuid) + '/tree/nodes/columnpositions/' + encodeURIComponent(parentNodeId);
    console.debug(nodeUpdateUrl);
    return backendFetch(nodeUpdateUrl, {
        method: 'put',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nodes),
    });
}

export function fetchNetworkModificationTreeNode(studyUuid, nodeUuid) {
    console.info('Fetching network modification tree node : ', nodeUuid);
    const url = getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeUuid);
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationTree(studyUuid) {
    console.info('Fetching network modification tree');
    const url = getStudyUrl(studyUuid) + '/tree';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationSubtree(studyUuid, parentId) {
    console.info('Fetching network modification tree node : ', parentId);
    const url = getStudyUrl(studyUuid) + '/subtree?parentNodeUuid=' + encodeURIComponent(parentId);
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchStashedNodes(studyUuid) {
    console.info('Fetching stashed nodes for study : ', studyUuid);
    const url = getStudyUrl(studyUuid) + '/tree/nodes/stash';
    console.debug(url);
    return backendFetchJson(url);
}

export function restoreStashedNodes(studyUuid, nodeToRestoreIds, anchorNodeId) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append(
        'ids',
        nodeToRestoreIds.map((id) => encodeURIComponent(id))
    );
    urlSearchParams.append('anchorNodeId', encodeURIComponent(anchorNodeId));

    console.info('Restoring nodes %s under nodes %s of study : %s', nodeToRestoreIds, nodeToRestoreIds, studyUuid);
    const url = getStudyUrl(studyUuid) + '/tree/nodes/restore?' + urlSearchParams.toString();

    console.debug(url);
    return backendFetch(url, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function deleteStashedNodes(studyUuid, nodeToDeleteIds) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append(
        'ids',
        nodeToDeleteIds.map((id) => encodeURIComponent(id))
    );
    urlSearchParams.append('deleteChildren', true);

    console.info('Delete nodes %s of study : %s', nodeToDeleteIds, studyUuid);
    const url = getStudyUrl(studyUuid) + '/tree/nodes?' + urlSearchParams.toString();

    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}
