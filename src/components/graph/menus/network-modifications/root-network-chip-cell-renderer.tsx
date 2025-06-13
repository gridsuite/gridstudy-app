/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useMemo, SetStateAction } from 'react';
import {
    ActivableChip,
    ExcludedNetworkModifications,
    NetworkModificationMetadata,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { updateModificationStatusByRootNetwork } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { RootNetworkMetadata } from './network-modification-menu.type';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';

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

        const excludedList =
            modificationsToExclude.find((item) => item.rootNetworkUuid === rootNetwork.rootNetworkUuid)
                ?.modificationUuidsToExclude || [];

        return !excludedList.includes(modificationUuid);
    }, [modificationUuid, modificationsToExclude, rootNetwork]);

    const updateStatus = useCallback(
        (newStatus: boolean) => {
            if (!studyUuid || !modificationUuid || !currentNode) {
                return;
            }
            console.log('herrrreeeeee updating ????');

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

        setModificationsToExclude((prev) => {
            const updatedExcludedModifications = prev.map((modif) => {
                if (modif.rootNetworkUuid !== rootNetwork.rootNetworkUuid) {
                    return modif;
                }

                const isExcluded = modif.modificationUuidsToExclude.includes(modificationUuid);
                const modificationUuidsToExclude = isExcluded
                    ? modif.modificationUuidsToExclude.filter((id) => id !== modificationUuid)
                    : [...modif.modificationUuidsToExclude, modificationUuid];

                updateStatus(!isExcluded);

                return { ...modif, modificationUuidsToExclude };
            });

            const exists = prev.some((item) => item.rootNetworkUuid === rootNetwork.rootNetworkUuid);
            if (!exists) {
                updateStatus(false);
                return [
                    ...prev,
                    {
                        rootNetworkUuid: rootNetwork.rootNetworkUuid,
                        modificationUuidsToExclude: [modificationUuid],
                    },
                ];
            }

            return updatedExcludedModifications;
        });
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
