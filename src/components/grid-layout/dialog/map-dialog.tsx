/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Dialog, Fab, Theme } from '@mui/material';
import { useCallback, useRef } from 'react';
import type { UUID } from 'node:crypto';
import { EquipmentType, LineFlowMode, NetworkVisualizationParameters, useStateBoolean } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { resetMapEquipment, setMapDataLoading, setMapState, setOpenMap, setReloadMapNeeded } from 'redux/actions';
import NetworkMapPanel, { NetworkMapPanelRef } from 'components/network/network-map-panel';
import { Close } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import { CurrentTreeNode } from 'components/graph/tree-node.type';

const styles = {
    closeButton: (theme: Theme) => ({
        alignSelf: 'center',
        margin: theme.spacing(1),
        padding: theme.spacing(2),
    }),
};

interface MapDialogProps {
    studyUuid: UUID;
    onClose: () => void;
    errorMessage?: string;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    onOpenNetworkAreaDiagram: (elementId?: string) => void;
    currentRootNetworkUuid: UUID;
    networkVisuParams: NetworkVisualizationParameters;
    currentNode: CurrentTreeNode;
}

export const MapDialog = (props: MapDialogProps) => {
    const {
        studyUuid,
        onClose,
        currentRootNetworkUuid,
        networkVisuParams,
        showInSpreadsheet,
        onOpenNetworkAreaDiagram,
        currentNode,
    } = props;

    const dispatch = useDispatch();

    const mapOpen = useSelector((state: AppState) => state.mapOpen);

    const isInDrawingMode = useStateBoolean(false);
    const networkMapPanelRef = useRef<NetworkMapPanelRef>(null);

    const handleCloseMap = useCallback(
        (event?: any, reason?: string) => {
            if (isInDrawingMode.value) {
                networkMapPanelRef.current?.leaveDrawingMode();
                if (reason && reason === 'escapeKeyDown') {
                    return; // Do not close the map but only the drawing mode
                }
            }
            if (networkMapPanelRef.current) {
                const currentMapState = networkMapPanelRef.current.getCurrentMapState?.();
                if (currentMapState) {
                    dispatch(setMapState(currentMapState));
                }
            }
            dispatch(setOpenMap(false));
            dispatch(resetMapEquipment());
            dispatch(setMapDataLoading(false));
            dispatch(setReloadMapNeeded(true));
            onClose();
        },
        [dispatch, isInDrawingMode, onClose]
    );

    return (
        <Dialog open={mapOpen} onClose={handleCloseMap} fullScreen>
            <Fab onClick={handleCloseMap} size="small" aria-label="close" variant="extended" sx={styles.closeButton}>
                <Close fontSize="small" />
                <FormattedMessage id="close" />
            </Fab>
            <NetworkMapPanel
                ref={networkMapPanelRef}
                studyUuid={studyUuid}
                visible={mapOpen}
                lineFullPath={networkVisuParams.mapParameters.lineFullPath}
                lineParallelPath={networkVisuParams.mapParameters.lineParallelPath}
                lineFlowMode={networkVisuParams.mapParameters.lineFlowMode as LineFlowMode}
                currentNode={currentNode}
                currentRootNetworkUuid={currentRootNetworkUuid}
                showInSpreadsheet={(eq) => {
                    handleCloseMap();
                    showInSpreadsheet(eq);
                }}
                onOpenNetworkAreaDiagram={onOpenNetworkAreaDiagram}
                onPolygonChanged={() => {}}
                isInDrawingMode={isInDrawingMode}
            />
        </Dialog>
    );
};

export default MapDialog;
