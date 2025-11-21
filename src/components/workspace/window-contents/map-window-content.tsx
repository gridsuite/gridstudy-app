/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import type { UUID } from 'node:crypto';
import { LineFlowMode, useStateBoolean } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { resetMapEquipment, setMapDataLoading, setReloadMapNeeded } from '../../../redux/actions';
import NetworkMapPanel, { NetworkMapPanelRef } from '../../network/network-map-panel';
import type { CurrentTreeNode } from '../../graph/tree-node.type';

interface MapWindowContentProps {
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    currentNode: CurrentTreeNode;
}

export const MapWindowContent = ({ studyUuid, currentRootNetworkUuid, currentNode }: MapWindowContentProps) => {
    const dispatch = useDispatch();
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const isInDrawingMode = useStateBoolean(false);
    const networkMapPanelRef = useRef<NetworkMapPanelRef>(null);

    useEffect(() => {
        return () => {
            dispatch(resetMapEquipment());
            dispatch(setMapDataLoading(false));
            dispatch(setReloadMapNeeded(true));
        };
    }, [dispatch]);

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <NetworkMapPanel
                ref={networkMapPanelRef}
                studyUuid={studyUuid}
                visible={true}
                lineFullPath={networkVisuParams.mapParameters.lineFullPath}
                lineParallelPath={networkVisuParams.mapParameters.lineParallelPath}
                lineFlowMode={networkVisuParams.mapParameters.lineFlowMode as LineFlowMode}
                currentNode={currentNode}
                currentRootNetworkUuid={currentRootNetworkUuid}
                onPolygonChanged={() => {}}
                isInDrawingMode={isInDrawingMode}
            />
        </Box>
    );
};
