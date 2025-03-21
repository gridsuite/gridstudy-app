/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useMemo } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { updateModificationStatusByRootNetwork } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { ChipCellRenderer } from '../../../spreadsheet/utils/chip-cell-renderer';
import { NetworkModificationInfos, RootNetworkMetadata } from './network-modification-menu.type';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';

interface ChipRootNetworkCellRendererProps {
    data?: NetworkModificationInfos;
    rootNetwork: RootNetworkMetadata;
}

const ChipRootNetworkCellRenderer = (props: ChipRootNetworkCellRendererProps) => {
    const { data, rootNetwork } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const { snackError } = useSnackMessage();
    const modificationUuid = data?.modificationInfos.uuid;

    const modificationactivatedByRootNetwork = useMemo(
        () => data?.activationStatusByRootNetwork[rootNetwork.rootNetworkUuid] ?? false,
        [rootNetwork.rootNetworkUuid, data]
    );

    const rootNetworkTag = rootNetwork.tag;
    const handleModificationStatusByRootNetworkUpdate = useCallback(() => {
        if (!studyUuid || !modificationUuid || !currentNode) {
            return;
        }

        setIsLoading(true);
        updateModificationStatusByRootNetwork(
            studyUuid,
            currentNode?.id,
            rootNetwork.rootNetworkUuid,
            modificationUuid,
            !modificationactivatedByRootNetwork
        )
            .catch((err) => {
                snackError({ messageTxt: err.message, messageId: 'modificationActivationByRootNetworkError' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [studyUuid, currentNode, modificationUuid, rootNetwork, snackError, modificationactivatedByRootNetwork]);

    return (
        <ChipCellRenderer
            label={rootNetworkTag}
            isActivated={modificationactivatedByRootNetwork}
            isDisabled={isLoading || isAnyNodeBuilding || mapDataLoading}
            onClick={handleModificationStatusByRootNetworkUpdate}
        />
    );
};

export default ChipRootNetworkCellRenderer;
