/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { SetStateAction, useCallback, useState } from 'react';
import { Switch, Tooltip } from '@mui/material';
import { NetworkModificationMetadata, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { setModificationMetadata } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { AppState } from 'redux/reducer';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';

export interface SwitchCellRendererProps {
    data: NetworkModificationMetadata;
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
}

const SwitchCellRenderer = (props: SwitchCellRendererProps) => {
    const { data, setModifications } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const { snackError } = useSnackMessage();

    const modificationUuid = data?.uuid;
    const modificationActivated = data?.activated;

    const updateModification = useCallback(
        (activated: boolean) => {
            if (!modificationUuid) {
                return;
            }
            setModificationMetadata(studyUuid, currentNode?.id, modificationUuid, {
                activated: activated,
                type: data?.type,
            })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'networkModificationActivationError' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [modificationUuid, studyUuid, currentNode?.id, data?.type, snackError]
    );

    const toggleModificationActive = useCallback(() => {
        setIsLoading(true);
        setModifications((oldModifications) => {
            const modificationToUpdateIndex = oldModifications.findIndex((m) => m.uuid === modificationUuid);
            if (modificationToUpdateIndex === -1) {
                return oldModifications;
            }
            const newModifications = [...oldModifications];
            const newStatus = !newModifications[modificationToUpdateIndex].activated;

            newModifications[modificationToUpdateIndex] = {
                ...newModifications[modificationToUpdateIndex],
                activated: newStatus,
            };

            updateModification(newStatus);
            return newModifications;
        });
    }, [modificationUuid, updateModification, setModifications]);

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
