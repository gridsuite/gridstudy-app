/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentRootNetworkUuid, setCurrentTreeNode } from 'redux/actions';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { useStudyScopedNavigationKeys } from './use-study-scoped-navigation-keys';

/**
 * Custom hook that provides synchronized navigation actions for setting the current root network UUID and tree node.
 * It dispatches Redux actions and optionally syncs the values to localStorage when sync is enabled.
 * This ensures navigation state is persisted across browser tabs when synchronization is active.
 */
export const useSyncNavigationActions = () => {
    const dispatch = useDispatch();
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);

    const keys = useStudyScopedNavigationKeys();

    // Callback for setting current root network UUID with sync
    const setCurrentRootNetworkUuidWithSync = useCallback(
        (uuid: UUID) => {
            dispatch(setCurrentRootNetworkUuid(uuid));
            if (syncEnabled) {
                try {
                    localStorage.setItem(keys.ROOT_NETWORK_UUID, JSON.stringify(uuid));
                } catch (err) {
                    console.warn('Failed to set root network UUID in localStorage:', err);
                }
            }
        },
        [dispatch, syncEnabled, keys.ROOT_NETWORK_UUID]
    );

    // Callback for setting current tree node with sync
    const setCurrentTreeNodeWithSync = useCallback(
        (treeNode: CurrentTreeNode) => {
            dispatch(setCurrentTreeNode(treeNode));
            if (syncEnabled) {
                try {
                    localStorage.setItem(keys.TREE_NODE, JSON.stringify(treeNode));
                } catch (err) {
                    console.warn('Failed to set current tree node in localStorage:', err);
                }
            }
        },
        [dispatch, syncEnabled, keys.TREE_NODE]
    );

    return {
        setCurrentRootNetworkUuidWithSync,
        setCurrentTreeNodeWithSync,
    };
};
