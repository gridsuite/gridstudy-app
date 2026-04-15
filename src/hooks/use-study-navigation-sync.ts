/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSyncEnabled, setCurrentRootNetworkUuid, setCurrentTreeNode } from 'redux/actions';
import { AppState } from 'redux/reducer.type';
import { STUDY_NAVIGATION_SYNC_KEY, StudyNavigationSyncEntry } from 'redux/session-storage/navigation-local-storage';

/**
 * Custom hook that synchronizes navigation state from localStorage to Redux when sync is enabled.
 * It listens for storage events and visibility changes to update the current root network UUID and tree node,
 * ensuring consistency across browser tabs.
 */
const useStudyNavigationSync = () => {
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const dispatch = useDispatch();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyNavigationSyncKey = studyUuid ? `${STUDY_NAVIGATION_SYNC_KEY}:${studyUuid}` : null;

    const updateRootNetworkUuid = useCallback(
        (uuid: UUID | null) => {
            if (uuid !== null && uuid !== currentRootNetworkUuid) {
                // Only update if the root network UUID exists in the current study's root networks
                const rootNetwork = rootNetworks.find((rn) => rn.rootNetworkUuid === uuid);
                if (rootNetwork) {
                    dispatch(setCurrentRootNetworkUuid(uuid));
                }
            }
        },
        [dispatch, currentRootNetworkUuid, rootNetworks]
    );

    const updateTreeNode = useCallback(
        (uuid: UUID | null) => {
            if (uuid !== null && uuid !== currentTreeNode?.id) {
                // Only update if the tree node exists in the current study's tree model
                const currentNode = treeModel?.treeNodes.find((node) => node.id === uuid);
                if (currentNode) {
                    dispatch(setCurrentTreeNode({ ...currentNode }));
                }
            }
        },
        [dispatch, currentTreeNode, treeModel]
    );

    // Stable refs so the storage effect doesn't re-register listeners on every navigation
    const updateRootNetworkUuidRef = useRef(updateRootNetworkUuid);
    const updateTreeNodeRef = useRef(updateTreeNode);
    useEffect(() => {
        updateRootNetworkUuidRef.current = updateRootNetworkUuid;
        updateTreeNodeRef.current = updateTreeNode;
    });

    const syncFromLocalStorage = useCallback(() => {
        try {
            const raw = studyNavigationSyncKey ? localStorage.getItem(studyNavigationSyncKey) : null;
            if (raw !== null) {
                const entry = JSON.parse(raw) as StudyNavigationSyncEntry;
                updateRootNetworkUuidRef.current(entry.rootNetworkUuid);
                updateTreeNodeRef.current(entry.treeNodeUuid);
            }
        } catch (err) {
            console.warn('Failed to sync from localStorage:', err);
        }
    }, [studyNavigationSyncKey]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== studyNavigationSyncKey || event.newValue === null) {
                return;
            }
            try {
                const entry = JSON.parse(event.newValue) as StudyNavigationSyncEntry;
                // Always sync syncEnabled from other tabs
                dispatch(selectSyncEnabled(entry.syncEnabled));
                if (!entry.syncEnabled || document.visibilityState !== 'visible') {
                    return;
                }
                updateRootNetworkUuidRef.current(entry.rootNetworkUuid);
                updateTreeNodeRef.current(entry.treeNodeUuid);
            } catch (err) {
                console.warn('Failed to parse storage event value', err);
            }
        };

        const handleVisibility = () => {
            if (!syncEnabled || document.visibilityState !== 'visible') {
                return;
            }
            syncFromLocalStorage();
        };

        globalThis.addEventListener('storage', handleStorage);
        if (syncEnabled) {
            handleVisibility();
            document.addEventListener('visibilitychange', handleVisibility);
        }

        return () => {
            globalThis.removeEventListener('storage', handleStorage);
            if (syncEnabled) {
                document.removeEventListener('visibilitychange', handleVisibility);
            }
        };
    }, [dispatch, syncEnabled, syncFromLocalStorage, studyNavigationSyncKey]);
};

export default useStudyNavigationSync;
