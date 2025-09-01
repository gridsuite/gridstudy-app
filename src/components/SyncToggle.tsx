/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import { Sync, SyncDisabled } from '@mui/icons-material';
import { selectSyncEnabled } from '../redux/actions';
import { BASE_KEYS } from 'constants/study-navigation-sync-constants';
import { AppState } from 'redux/reducer';

const SyncToggle = () => {
    const dispatch = useDispatch();
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const STORAGE_KEYS = useMemo(
        () => ({
            SYNC_ENABLED: `${BASE_KEYS.SYNC_ENABLED}-${studyUuid}`,
            ROOT_NETWORK_UUID: `${BASE_KEYS.ROOT_NETWORK_UUID}-${studyUuid}`,
            TREE_NODE: `${BASE_KEYS.TREE_NODE}-${studyUuid}`,
        }),
        [studyUuid]
    );

    const handleToggle = () => {
        const newValue = !syncEnabled;
        dispatch(selectSyncEnabled(newValue));
        try {
            localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, JSON.stringify(newValue));
            if (newValue) {
                // Save current values when enabling sync for other tabs
                localStorage.setItem(STORAGE_KEYS.TREE_NODE, JSON.stringify(currentTreeNode));
                localStorage.setItem(STORAGE_KEYS.ROOT_NETWORK_UUID, JSON.stringify(currentRootNetworkUuid));
            }
        } catch (err) {
            console.warn('Failed to toggle sync:', err);
        }
    };

    return (
        <IconButton onClick={handleToggle} size="small">
            {syncEnabled ? <Sync /> : <SyncDisabled />}
        </IconButton>
    );
};

export default SyncToggle;
