/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useMemo, SetStateAction } from 'react';
import { ActivableChip, NetworkModificationMetadata, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { updateModificationStatusByRootNetwork } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { ExcludedNetworkModifications, RootNetworkMetadata } from './network-modification-menu.type';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';
import type { UUID } from 'node:crypto';

function getUpdatedExcludedModifications(
    prev: ExcludedNetworkModifications[],
    rootNetworkUuid: UUID,
    modificationUuid: UUID,
    updateStatus: (isExcluded: boolean) => void
): ExcludedNetworkModifications[] {
    const exists = prev.some((item) => item.rootNetworkUuid === rootNetworkUuid);

    if (exists) {
        return prev.map((modif) => {
            if (modif.rootNetworkUuid !== rootNetworkUuid) {
                return modif;
            }

            const isExcluded = modif.modificationUuidsToExclude.includes(modificationUuid);
            const newModificationUuidsToExclude = isExcluded
                ? modif.modificationUuidsToExclude.filter((id) => id !== modificationUuid)
                : [...modif.modificationUuidsToExclude, modificationUuid];

            // If previously excluded, now it is activated (true), else deactivated (false)
            updateStatus(isExcluded);

            return {
                ...modif,
                modificationUuidsToExclude: newModificationUuidsToExclude,
            };
        });
    } else {
        updateStatus(false);
        return [
            ...prev,
            {
                rootNetworkUuid: rootNetworkUuid,
                modificationUuidsToExclude: [modificationUuid],
            },
        ];
    }
}

interface RootNetworkChipCellRendererProps {
    data?: NetworkModificationMetadata;
    modificationsToExclude: ExcludedNetworkModifications[];
    setModificationsToExclude: React.Dispatch<SetStateAction<ExcludedNetworkModifications[]>>;
    rootNetwork: RootNetworkMetadata;
}

const RootNetworkChipCellRenderer = ({
    data,
    rootNetwork,
    modificationsToExclude,
    setModificationsToExclude,
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

        const excludedSet = new Set(
            modificationsToExclude.find((item) => item.rootNetworkUuid === rootNetwork.rootNetworkUuid)
                ?.modificationUuidsToExclude || []
        );

        return !excludedSet.has(modificationUuid);
    }, [modificationUuid, modificationsToExclude, rootNetwork.rootNetworkUuid, rootNetwork.isCreating]);

    const updateStatus = useCallback(
        (newStatus: boolean) => {
            if (!studyUuid || !modificationUuid || !currentNode) {
                setIsLoading(false);
                return;
            }

            updateModificationStatusByRootNetwork(
                studyUuid,
                currentNode?.id,
                rootNetwork.rootNetworkUuid,
                modificationUuid,
                newStatus
            )
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'modificationActivationByRootNetworkError' });
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

        setModificationsToExclude((prev) =>
            getUpdatedExcludedModifications(prev, rootNetwork.rootNetworkUuid, modificationUuid, updateStatus)
        );
    }, [modificationUuid, rootNetwork.rootNetworkUuid, setModificationsToExclude, updateStatus]);

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
