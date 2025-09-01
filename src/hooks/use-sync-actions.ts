/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentRootNetworkUuid, setCurrentTreeNode } from 'redux/actions';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { BASE_KEYS } from 'constants/study-navigation-sync-constants';

// Hook for setting current root network UUID with sync
export const useSetCurrentRootNetworkUuid = () => {
    const dispatch = useDispatch();
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const key = useMemo(() => `${studyUuid}-${BASE_KEYS.ROOT_NETWORK_UUID}`, [studyUuid]);

    return useCallback(
        (uuid: UUID) => {
            dispatch(setCurrentRootNetworkUuid(uuid));
            if (syncEnabled) {
                try {
                    localStorage.setItem(key, JSON.stringify(uuid));
                } catch (err) {
                    console.warn('Failed to set root network UUID in localStorage:', err);
                }
            }
        },
        [dispatch, syncEnabled, key]
    );
};

// Hook for setting current tree node with sync
export const useSetCurrentTreeNode = () => {
    const dispatch = useDispatch();
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const key = useMemo(() => `${studyUuid}-${BASE_KEYS.TREE_NODE}`, [studyUuid]);

    return useCallback(
        (treeNode: CurrentTreeNode) => {
            dispatch(setCurrentTreeNode(treeNode));
            if (syncEnabled) {
                try {
                    localStorage.setItem(key, JSON.stringify(treeNode));
                } catch (err) {
                    console.warn('Failed to set current tree node in localStorage:', err);
                }
            }
        },
        [dispatch, syncEnabled, key]
    );
};
