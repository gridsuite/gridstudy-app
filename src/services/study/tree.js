/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from '../../utils/rest-api';
import { getStudyUrl, STUDY_PATHS } from './index';

export function deleteTreeNode(studyUuid, nodeId) {
    console.info('Deleting tree node : ', nodeId);
    const url = `${getStudyUrl(studyUuid)}/tree/nodes/${encodeURIComponent(
        nodeId
    )}`;
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    });
}

export function deleteSubtree(studyUuid, parentNodeId) {
    console.info('Deleting node subtree : ', parentNodeId);

    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('deleteChildren', 'true');

    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes/${encodeURIComponent(parentNodeId)}?${urlSearchParams}`;
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    });
}

export function updateTreeNode(studyUuid, node) {
    const nodeUpdateUrl = `${getStudyUrl(studyUuid)}${STUDY_PATHS.tree}/nodes/`;
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

export function copyTreeNode(
    sourceStudyId,
    targetStudyId,
    nodeToCopyUuid,
    referenceNodeUuid,
    insertMode
) {
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('insertMode', insertMode);
    urlSearchParams.append('nodeToCopyUuid', nodeToCopyUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);
    urlSearchParams.append('sourceStudyUuid', sourceStudyId);

    const nodeCopyUrl = `${getStudyUrl(targetStudyId)}${
        STUDY_PATHS.tree
    }/nodes?${urlSearchParams}`;

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
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('insertMode', insertMode);
    urlSearchParams.append('nodeToCutUuid', nodeToCutUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);

    const nodeCutUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes?${urlSearchParams}`;

    console.debug(nodeCutUrl);
    return backendFetch(nodeCutUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function createTreeNode(studyUuid, parentId, insertMode, node) {
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('mode', insertMode);

    const nodeCreationUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes/${encodeURIComponent(parentId)}?${urlSearchParams}`;

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

export function cutSubtree(targetStudyId, nodeToCopyUuid, referenceNodeUuid) {
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('subtreeToCutParentNodeUuid', nodeToCopyUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);

    const nodeCopyUrl = `${getStudyUrl(targetStudyId)}${
        STUDY_PATHS.tree
    }/subtrees?${urlSearchParams}`;

    console.debug(nodeCopyUrl);
    return backendFetch(nodeCopyUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function copySubtree(targetStudyId, nodeToCopyUuid, referenceNodeUuid) {
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('subtreeToCopyParentNodeUuid', nodeToCopyUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);

    const nodeCopyUrl = `${getStudyUrl(targetStudyId)}${
        STUDY_PATHS.tree
    }/subtrees?${urlSearchParams}`;

    console.debug(nodeCopyUrl);
    return backendFetch(nodeCopyUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function fetchNetworkModificationTree(studyUuid) {
    console.info('Fetching network modification tree');
    const url = `${getStudyUrl(studyUuid)}${STUDY_PATHS.tree}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationTreeNode(studyUuid, nodeUuid) {
    console.info('Fetching network modification tree node : ', nodeUuid);
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes/${encodeURIComponent(nodeUuid)}`;
    console.debug(url);
    return backendFetchJson(url);
}
