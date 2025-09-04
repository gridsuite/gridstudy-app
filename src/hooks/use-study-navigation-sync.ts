/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSyncEnabled, setCurrentRootNetworkUuid, setCurrentTreeNode } from 'redux/actions';
import { AppState } from 'redux/reducer';
import { useStudyScopedNavigationKeys } from './use-study-scoped-navigation-keys';

/**
 * Custom hook that synchronizes navigation state from localStorage to Redux when sync is enabled.
 * It listens for storage events and visibility changes to update the current root network UUID and tree node,
 * ensuring consistency across browser tabs.
 */
const useStudyNavigationSync = () => {
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const dispatch = useDispatch();

    const STORAGE_KEYS = useStudyScopedNavigationKeys();

    const updateRootNetworkUuid = useCallback(
        (uuid: UUID | null) => {
            if (uuid !== null && uuid !== currentRootNetworkUuid) {
                dispatch(setCurrentRootNetworkUuid(uuid));
            }
        },
        [dispatch, currentRootNetworkUuid]
    );

    const updateTreeNode = useCallback(
        (uuid: UUID | null) => {
            if (uuid !== null && uuid !== currentTreeNode?.id) {
                const currentNode = treeModel?.treeNodes.find((node) => node.id === uuid);
                if (currentNode) {
                    dispatch(setCurrentTreeNode({ ...currentNode }));
                }
            }
        },
        [dispatch, currentTreeNode, treeModel]
    );

    const keyActions = useMemo(
        () => ({
            [STORAGE_KEYS.ROOT_NETWORK_UUID]: updateRootNetworkUuid,
            [STORAGE_KEYS.TREE_NODE_UUID]: updateTreeNode,
        }),
        [STORAGE_KEYS.ROOT_NETWORK_UUID, STORAGE_KEYS.TREE_NODE_UUID, updateRootNetworkUuid, updateTreeNode]
    );

    const syncFromLocalStorage = useCallback(() => {
        try {
            Object.entries(keyActions).forEach(([key, updateFn]) => {
                const rawValue = localStorage.getItem(key);
                if (rawValue !== null) {
                    const parsed = JSON.parse(rawValue);
                    updateFn(parsed);
                }
            });
        } catch (err) {
            console.warn('Failed to sync from localStorage:', err);
        }
    }, [keyActions]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEYS.SYNC_ENABLED) {
                try {
                    if (event.newValue === null) {
                        return;
                    }
                    const newSync = JSON.parse(event.newValue);
                    dispatch(selectSyncEnabled(newSync));
                } catch (err) {
                    console.warn('Failed to parse storage event value', err);
                }
                return;
            }
            if (
                !syncEnabled ||
                document.visibilityState !== 'visible' ||
                event.newValue === null ||
                event.key === null
            ) {
                return;
            }
            const updateFn = keyActions[event.key];
            if (updateFn) {
                try {
                    const parsed = JSON.parse(event.newValue);
                    updateFn(parsed);
                } catch (err) {
                    console.warn('Failed to parse storage event value', err);
                }
            }
        };

        const handleVisibility = () => {
            if (!syncEnabled || document.visibilityState !== 'visible') {
                return;
            }
            syncFromLocalStorage();
        };

        window.addEventListener('storage', handleStorage);
        if (syncEnabled) {
            handleVisibility();
            document.addEventListener('visibilitychange', handleVisibility);
        }

        return () => {
            window.removeEventListener('storage', handleStorage);
            if (syncEnabled) {
                document.removeEventListener('visibilitychange', handleVisibility);
            }
        };
    }, [dispatch, syncEnabled, syncFromLocalStorage, keyActions, STORAGE_KEYS.SYNC_ENABLED]);
};

export default useStudyNavigationSync;
