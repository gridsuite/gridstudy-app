/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback } from 'react';
import { Switch, Tooltip } from '@mui/material';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { setModificationActivated } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { AppState } from 'redux/reducer';
import { ICellRendererParams } from 'ag-grid-community';
import { NetworkModificationInfos } from './network-modification-menu.type';

const CellRendererSwitch = (props: ICellRendererParams<NetworkModificationInfos>) => {
    const { data, api } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const { snackError } = useSnackMessage();

    const modificationUuid = data?.modificationInfos.uuid; // Get the UUID of the modification
    const modificationActivated = data?.modificationInfos.activated; // Check if the modification is activated

    const updateModification = useCallback(
        (activated: boolean) => {
            if (!modificationUuid) {
                return;
            }
            setModificationActivated(studyUuid, currentNode?.id, modificationUuid, activated)
                .catch((err) => {
                    snackError({ messageTxt: err.message, messageId: 'networkModificationActivationError' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [studyUuid, currentNode?.id, modificationUuid, snackError]
    );

    const toggleModificationActive = useCallback(() => {
        setIsLoading(true);
        const updatedActivated = !modificationActivated;

        // Update the grid data with the new activated status
        api.stopEditing();
        // Trigger the API to update the state on the server (or whatever data source you're using)
        updateModification(updatedActivated);
    }, [modificationActivated, updateModification, api]);

    return (
        <Tooltip title={<FormattedMessage id={modificationActivated ? 'disable' : 'enable'} />} arrow>
            <span>
                <Switch
                    size="small"
                    disabled={isLoading}
                    checked={modificationActivated}
                    onClick={toggleModificationActive}
                />
            </span>
        </Tooltip>
    );
};

export default CellRendererSwitch;
