/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useMemo, SetStateAction } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { updateModificationStatusByRootNetwork } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { ChipCellRenderer } from '../../../spreadsheet/utils/chip-cell-renderer';
import { NetworkModificationInfos, RootNetworkMetadata } from './network-modification-menu.type';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';

interface ChipRootNetworkCellRendererProps {
    data?: NetworkModificationInfos;
    setModifications: React.Dispatch<SetStateAction<NetworkModificationInfos[]>>;
    rootNetwork: RootNetworkMetadata;
}

const ChipRootNetworkCellRenderer = (props: ChipRootNetworkCellRendererProps) => {
    const { data, rootNetwork, setModifications } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const { snackError } = useSnackMessage();
    const modificationUuid = data?.modificationInfos.uuid;

    const modificationActivatedByRootNetwork = useMemo(
        () => data?.activationStatusByRootNetwork[rootNetwork.rootNetworkUuid] ?? false,
        [rootNetwork.rootNetworkUuid, data]
    );

    const rootNetworkTag = rootNetwork.tag;

    const updateStatus = useCallback(
        (newStatus: boolean) => {
            if (!studyUuid || !modificationUuid || !currentNode) {
                return;
            }
            updateModificationStatusByRootNetwork(
                studyUuid,
                currentNode?.id,
                rootNetwork.rootNetworkUuid,
                modificationUuid,
                newStatus
            )
                .catch((err) => {
                    snackError({ messageTxt: err.message, messageId: 'modificationActivationByRootNetworkError' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [studyUuid, modificationUuid, currentNode, rootNetwork, snackError]
    );

    const handleModificationStatusByRootNetworkUpdate = useCallback(() => {
        setIsLoading(true);

        setModifications((oldModifications) => {
            const modificationToUpdateIndex = oldModifications.findIndex(
                (m) => m.modificationInfos.uuid === modificationUuid
            );
            if (modificationToUpdateIndex === -1) {
                return oldModifications;
            }

            const newModifications = [...oldModifications];
            const newStatus =
                !newModifications[modificationToUpdateIndex].activationStatusByRootNetwork[rootNetwork.rootNetworkUuid];

            newModifications[modificationToUpdateIndex] = {
                ...newModifications[modificationToUpdateIndex],
                activationStatusByRootNetwork: {
                    ...newModifications[modificationToUpdateIndex].activationStatusByRootNetwork,
                    [rootNetwork.rootNetworkUuid]: newStatus,
                },
            };

            updateStatus(newStatus);
            return newModifications;
        });
    }, [modificationUuid, setModifications, updateStatus, rootNetwork.rootNetworkUuid]);

    return (
        <ChipCellRenderer
            label={rootNetworkTag}
            isActivated={modificationActivatedByRootNetwork}
            isDisabled={isLoading || isAnyNodeBuilding || mapDataLoading}
            onClick={handleModificationStatusByRootNetworkUpdate}
        />
    );
};

export default ChipRootNetworkCellRenderer;
