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
import { AppState } from 'redux/reducer.type';
import { useIntl } from 'react-intl';
import { saveStudyNavigationSync } from 'redux/session-storage/navigation-local-storage';

const StudyNavigationSyncToggle = () => {
    const dispatch = useDispatch();
    const syncEnabled = useSelector((state: AppState) => state.syncEnabled);
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();

    const handleToggle = () => {
        const newValue = !syncEnabled;
        dispatch(selectSyncEnabled(newValue));
        if (studyUuid) {
            const patch = newValue
                ? // Save current navigation state when enabling sync for other tabs
                  {
                      syncEnabled: newValue,
                      treeNodeUuid: currentTreeNode?.id ?? null,
                      rootNetworkUuid: currentRootNetworkUuid,
                  }
                : { syncEnabled: newValue };
            saveStudyNavigationSync(studyUuid, patch);
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
