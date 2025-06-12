/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useMemo, SetStateAction } from 'react';
import { ActivableChip, NetworkModificationMetadata, useSnackMessage } from '@gridsuite/commons-ui';
import { updateModificationStatusByRootNetwork } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { RootNetworkMetadata } from './network-modification-menu.type';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';
import { UUID } from 'crypto';

interface RootNetworkChipCellRendererProps {
    data?: NetworkModificationMetadata;
    modificationsToExcludeByRootNetwork: Record<UUID, UUID[]>;
    setModificationsToExcludeByRootNetwork: React.Dispatch<SetStateAction<Record<UUID, UUID[]>>>;
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    rootNetwork: RootNetworkMetadata;
}

const RootNetworkChipCellRenderer = ({
    data,
    rootNetwork,
    modificationsToExcludeByRootNetwork,
    setModificationsToExcludeByRootNetwork,
}: RootNetworkChipCellRendererProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const { snackError } = useSnackMessage();
    const modificationUuid = data?.uuid;

    const isModificationActivated = useMemo(() => {
        if (!modificationUuid) {
            return false;
        }
        if (rootNetwork.isCreating) {
            return true;
        }

        const excludedList = modificationsToExcludeByRootNetwork[rootNetwork.rootNetworkUuid] || [];
        return !excludedList.includes(modificationUuid);
    }, [modificationUuid, modificationsToExcludeByRootNetwork, rootNetwork]);

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

    const handleModificationActivationByRootNetwork = useCallback(() => {
        if (!modificationUuid) {
            return;
        }

        setIsLoading(true);

        setModificationsToExcludeByRootNetwork((prev) => {
            const currentExcludedModifications = prev[rootNetwork.rootNetworkUuid] || [];
            const isExcluded = currentExcludedModifications.includes(modificationUuid);
            const updatedModificationsToExclude = isExcluded
                ? currentExcludedModifications.filter((id) => id !== modificationUuid)
                : [...currentExcludedModifications, modificationUuid];

            updateStatus(isExcluded);

            return {
                ...prev,
                [rootNetwork.rootNetworkUuid]: updatedModificationsToExclude,
            };
        });
    }, [modificationUuid, rootNetwork.rootNetworkUuid, setModificationsToExcludeByRootNetwork, updateStatus]);

    return (
        <ActivableChip
            label={rootNetwork.tag}
            tooltipMessage={rootNetwork.name}
            isActivated={isModificationActivated}
            isDisabled={isLoading || isAnyNodeBuilding || mapDataLoading}
            onClick={handleModificationActivationByRootNetwork}
        />
    );
};

export default RootNetworkChipCellRenderer;
