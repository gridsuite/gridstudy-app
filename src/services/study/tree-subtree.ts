/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl } from './index';
import { backendFetch, backendFetchJson } from '../utils';
import { UUID } from 'crypto';
import { NodeInsertModes } from '../../components/graph/nodes/node-insert-modes';
import { AbstractNode, NodeType } from '../../components/graph/tree-node.type';
import { BUILD_STATUS } from '../../components/network/constants';

interface Node {
    name: string;
    type: NodeType;
    localBuildStatus: BUILD_STATUS;
    globalBuildStatus: BUILD_STATUS;
}
export function copySubtree(
    sourceStudyUuid: UUID,
    targetStudyUuid: UUID,
    nodeToCopyUuid: UUID,
    referenceNodeUuid: UUID
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

export function cutSubtree(targetStudyId: UUID, nodeToCopyUuid: UUID, referenceNodeUuid: UUID) {
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
    studyUuid: UUID,
    nodeToCutUuid: UUID,
    referenceNodeUuid: UUID,
    insertMode: NodeInsertModes
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
    sourceStudyUuid: UUID,
    targetStudyId: UUID,
    nodeToCopyUuid: UUID,
    referenceNodeUuid: UUID,
    insertMode: NodeInsertModes
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

export function createTreeNode(studyUuid: UUID, parentId: UUID, insertMode: NodeInsertModes, node: Node) {
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

export function stashTreeNode(studyUuid: UUID, nodeId: UUID) {
    console.info('Stash tree node : ', nodeId);
    const url = getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeId) + '/stash';
    console.debug(url);
    return backendFetch(url, {
        method: 'post',
    });
}

export function stashSubtree(studyUuid: UUID, parentNodeId: UUID) {
    console.info('stash node subtree : ', parentNodeId);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(parentNodeId) + '/stash?stashChildren=true';
    console.debug(url);
    return backendFetch(url, {
        method: 'post',
    });
}

export function updateTreeNode(
    studyUuid: UUID | null,
    node: {
        id: UUID | undefined;
        type: NodeType | undefined;
        name: string;
    }
) {
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

export function updateNodesColumnPositions(studyUuid: UUID, parentNodeId: UUID, nodes: AbstractNode[]) {
    const nodeUpdateUrl =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(parentNodeId) + '/children-column-positions';
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

export function fetchNetworkModificationTreeNode(studyUuid: UUID, nodeUuid: UUID, rootNetworkUuid: UUID) {
    console.info('Fetching network modification tree node : ', nodeUuid);
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('rootNetworkUuid', rootNetworkUuid);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeUuid) + '?' + urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationTree(studyUuid: UUID, rootNetworkUuid: UUID) {
    console.info('Fetching network modification tree');
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('rootNetworkUuid', rootNetworkUuid);
    const url = getStudyUrl(studyUuid) + '/tree?' + urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationSubtree(studyUuid: UUID, parentId: UUID) {
    console.info('Fetching network modification tree node : ', parentId);
    const url = getStudyUrl(studyUuid) + '/subtree?parentNodeUuid=' + encodeURIComponent(parentId);
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchStashedNodes(studyUuid: UUID) {
    console.info('Fetching stashed nodes for study : ', studyUuid);
    const url = getStudyUrl(studyUuid) + '/tree/nodes/stash';
    console.debug(url);
    return backendFetchJson(url);
}

export function restoreStashedNodes(studyUuid: UUID, nodeToRestoreIds: UUID[], anchorNodeId: UUID) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('ids', nodeToRestoreIds.map((id) => encodeURIComponent(id)).join(','));
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

export function deleteStashedNodes(studyUuid: UUID, nodeToDeleteIds: UUID[]) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('ids', nodeToDeleteIds.map((id) => encodeURIComponent(id)).join(','));
    urlSearchParams.append('deleteChildren', String(true));

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
