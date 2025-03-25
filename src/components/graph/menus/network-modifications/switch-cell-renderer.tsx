/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback, SetStateAction } from 'react';
import { Switch, Tooltip } from '@mui/material';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { setModificationActivated } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { AppState } from 'redux/reducer';
import { ICellRendererParams } from 'ag-grid-community';
import { NetworkModificationInfos } from './network-modification-menu.type';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';

export interface SwitchCellRendererProps extends ICellRendererParams<NetworkModificationInfos> {
    setModifications: React.Dispatch<SetStateAction<NetworkModificationInfos[]>>;
}

const SwitchCellRenderer = (props: SwitchCellRendererProps) => {
    const { data, api, setModifications } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const { snackError } = useSnackMessage();

    const modificationUuid = data?.modificationInfos.uuid;
    const modificationActivated = data?.modificationInfos.activated;

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
        setModifications((oldModifications) => {
            const modificationToUpdateIndex = oldModifications.findIndex(
                (m) => m.modificationInfos.uuid === modificationUuid
            );
            if (modificationToUpdateIndex === -1) {
                return oldModifications;
            }
            const newModifications = [...oldModifications];
            const newStatus = !newModifications[modificationToUpdateIndex].modificationInfos.activated;

            newModifications[modificationToUpdateIndex] = {
                ...newModifications[modificationToUpdateIndex],
                modificationInfos: {
                    ...newModifications[modificationToUpdateIndex].modificationInfos,
                    activated: newStatus,
                },
            };

            updateModification(newStatus);
            return newModifications;
        });
        api.stopEditing();
    }, [modificationUuid, updateModification, setModifications, api]);

    return (
        <Tooltip title={<FormattedMessage id={modificationActivated ? 'disable' : 'enable'} />} arrow>
            <span>
                <Switch
                    size="small"
                    disabled={isLoading || isAnyNodeBuilding || mapDataLoading}
                    checked={modificationActivated}
                    onClick={toggleModificationActive}
                />
            </span>
        </Tooltip>
    );
};

export default SwitchCellRenderer;
