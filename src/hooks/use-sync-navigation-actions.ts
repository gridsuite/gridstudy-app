/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentRootNetworkUuid, setCurrentTreeNode } from 'redux/actions';
import { AppState } from 'redux/reducer.type';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { saveStudyNavigationSync } from 'redux/session-storage/navigation-local-storage';

/**
 * Custom hook that provides synchronized navigation actions for setting the current root network UUID and tree node.
 * It dispatches Redux actions and optionally syncs the values to localStorage when sync is enabled.
 * This ensures navigation state is persisted across browser tabs when synchronization is active.
 */
export const useSyncNavigationActions = () => {
    const dispatch = useDispatch();
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    // Callback for setting current root network UUID with sync
    const setCurrentRootNetworkUuidWithSync = useCallback(
        (uuid: UUID) => {
            dispatch(setCurrentRootNetworkUuid(uuid));
            if (syncEnabled && studyUuid) {
                saveStudyNavigationSync(studyUuid, { rootNetworkUuid: uuid });
            }
        },
        [dispatch, syncEnabled, studyUuid]
    );

    // Callback for setting current tree node with sync
    const setCurrentTreeNodeWithSync = useCallback(
        (treeNode: CurrentTreeNode) => {
            dispatch(setCurrentTreeNode(treeNode));
            if (syncEnabled && studyUuid) {
                saveStudyNavigationSync(studyUuid, { treeNodeUuid: treeNode.id });
            }
        },
        [dispatch, syncEnabled, studyUuid]
    );

    return {
        setCurrentRootNetworkUuidWithSync,
        setCurrentTreeNodeWithSync,
    };
};
