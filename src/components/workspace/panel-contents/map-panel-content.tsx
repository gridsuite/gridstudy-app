/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { useEffect } from 'react';
import type { UUID } from 'node:crypto';
import { useDispatch, useSelector } from 'react-redux';
import { resetMapEquipment, setMapDataLoading, setReloadMapNeeded } from '../../../redux/actions';
import NetworkMapPanel from '../../network/network-map-panel';
import type { CurrentTreeNode } from '../../graph/tree-node.type';
import { selectPanel } from '../../../redux/slices/workspace-selectors';
import { RootState } from 'redux/store';

interface MapPanelContentProps {
    panelId: UUID;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    currentNode: CurrentTreeNode;
}

export const MapPanelContent = ({ panelId, studyUuid, currentRootNetworkUuid, currentNode }: MapPanelContentProps) => {
    const dispatch = useDispatch();
    const panel = useSelector((state: RootState) => selectPanel(state, panelId));

    useEffect(() => {
        return () => {
            dispatch(resetMapEquipment());
            dispatch(setMapDataLoading(false));
            dispatch(setReloadMapNeeded(true));
        };
    }, [dispatch]);

    // Pass panel size to trigger map resize when panel is resized
    const triggerMapResize = panel?.size ? [panel.size.width, panel.size.height] : undefined;

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <NetworkMapPanel
                studyUuid={studyUuid}
                currentNode={currentNode}
                currentRootNetworkUuid={currentRootNetworkUuid}
                triggerMapResizeOnChange={triggerMapResize}
            />
        </Box>
    );
};
