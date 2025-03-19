/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { updateModificationStatusByRootNetwork } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { NetworkModificationInfos } from 'components/graph/menus/network-modification-menu.type';
import { ColDef } from 'ag-grid-community';

interface ChipRootNetworkCellRendererProps {
    data: NetworkModificationInfos;
    colDef: ColDef<NetworkModificationInfos>;
}

const ChipRootNetworkCellRenderer = (props: ChipRootNetworkCellRendererProps) => {
    const { data, colDef } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const { snackError } = useSnackMessage();

    const modificationUuid = data.modificationInfos.uuid;
    const rootNetworkUuid = colDef.colId;

    const modificationactivatedByRootNetwork = data?.activationStatusByRootNetwork[rootNetworkUuid].activationStatus;
    const rootNetworkTag = data?.activationStatusByRootNetwork[rootNetworkUuid].rootNetworkTag;
    const handleModificationStatusByRootNetworkUpdate = useCallback(() => {
        if (!rootNetworkUuid || !studyUuid || !modificationUuid || !currentNode) {
            return;
        }

        setIsLoading(true);
        updateModificationStatusByRootNetwork(
            studyUuid,
            currentNode?.id,
            rootNetworkUuid,
            modificationUuid,
            !modificationactivatedByRootNetwork
        )
            .catch((err) => {
                snackError({ messageTxt: err.message, messageId: 'modificationActivationByRootNetworkError' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [studyUuid, currentNode, modificationUuid, rootNetworkUuid, snackError, modificationactivatedByRootNetwork]);

    return (
        <Tooltip title={rootNetworkTag} arrow>
            <span>
                <Chip
                    label={rootNetworkTag}
                    deleteIcon={modificationactivatedByRootNetwork ? <CheckCircleOutlineIcon /> : <CancelIcon />}
                    color="primary"
                    size="small"
                    variant={modificationactivatedByRootNetwork ? 'filled' : 'outlined'}
                    onDelete={() => {
                        handleModificationStatusByRootNetworkUpdate();
                    }}
                    onClick={() => {
                        handleModificationStatusByRootNetworkUpdate();
                    }}
                    disabled={isLoading}
                />
            </span>
        </Tooltip>
    );
};

export default ChipRootNetworkCellRenderer;
