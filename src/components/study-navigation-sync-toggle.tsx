/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDispatch, useSelector } from 'react-redux';
import { ToggleButton, Tooltip } from '@mui/material';
import { Sync, SyncDisabled } from '@mui/icons-material';
import { selectSyncEnabled } from '../redux/actions';
import { AppState } from 'redux/reducer';
import { useIntl } from 'react-intl';
import { useStudyScopedNavigationKeys } from 'hooks/use-study-scoped-navigation-keys';

const StudyNavigationSyncToggle = () => {
    const dispatch = useDispatch();
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const intl = useIntl();

    const STORAGE_KEYS = useStudyScopedNavigationKeys();

    const handleToggle = () => {
        const newValue = !syncEnabled;
        dispatch(selectSyncEnabled(newValue));
        try {
            localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, JSON.stringify(newValue));
            if (newValue) {
                // Save current values when enabling sync for other tabs
                localStorage.setItem(STORAGE_KEYS.TREE_NODE_UUID, JSON.stringify(currentTreeNode?.id));
                localStorage.setItem(STORAGE_KEYS.ROOT_NETWORK_UUID, JSON.stringify(currentRootNetworkUuid));
            }
        } catch (err) {
            console.warn('Failed to toggle sync:', err);
        }
    };

    return (
        <Tooltip
            title={
                syncEnabled
                    ? intl.formatMessage({ id: 'disableNavigationSync' })
                    : intl.formatMessage({ id: 'enableNavigationSync' })
            }
        >
            <ToggleButton value={'sync'} selected={syncEnabled} onChange={handleToggle} size="small">
                {syncEnabled ? <Sync /> : <SyncDisabled />}
            </ToggleButton>
        </Tooltip>
    );
};

export default StudyNavigationSyncToggle;
