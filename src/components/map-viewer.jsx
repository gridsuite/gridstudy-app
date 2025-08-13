/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactFlowProvider } from '@xyflow/react';
import { Box, useTheme } from '@mui/material';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';

import NetworkModificationTreePane from './network-modification-tree-pane';
import WaitingLoader from './utils/waiting-loader';
import DiagramGridLayout from './diagrams/diagram-grid-layout';
import NodeEditor from './graph/menus/network-modifications/node-editor';
import ScenarioEditor from './graph/menus/dynamic-simulation/scenario-editor';
import ResizeHandle from './resize-handle';

import { usePanelManager } from '../hooks/use-panel-manager';
import { PANEL_CONFIG, PANEL_IDS } from '../constants/panel.constants';
import { StudyDisplayMode } from './network-modification.type';

const styles = {
    table: { display: 'flex', flexDirection: 'column', height: '100%' },
    mapAndTreeContainer: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden' },
    panelContent: { display: 'flex', flexGrow: 1, height: '100%' },
};

const MapViewer = ({ studyUuid, currentRootNetworkUuid, tableEquipment, onTableEquipementChanged, onChangeTab }) => {
    const theme = useTheme();
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const isNetworkModificationTreeModelUpToDate = useSelector((state) => state.isNetworkModificationTreeModelUpToDate);
    const isEventScenarioDrawerOpen = useSelector((state) => state.isEventScenarioDrawerOpen);

    const { refs, state, handlers } = usePanelManager();

    const showInSpreadsheet = useCallback(
        (equipment) => {
            onTableEquipementChanged({
                id: equipment.equipmentId,
                type: equipment.equipmentType,
                changed: !tableEquipment.changed,
            });
            onChangeTab(1);
        },
        [tableEquipment.changed, onTableEquipementChanged, onChangeTab]
    );

    const networkModificationComponent = useMemo(
        () => (isEventScenarioDrawerOpen ? <ScenarioEditor /> : <NodeEditor />),
        [isEventScenarioDrawerOpen]
    );

    return (
        <Box sx={styles.table}>
            <Box sx={styles.mapAndTreeContainer}>
                <WaitingLoader message="LoadingRemoteData" loading={!isNetworkModificationTreeModelUpToDate} />
                <PanelGroup autoSaveId={`study-panels-${studyUuid}`} direction="horizontal">
                    {/* Left Panel Group */}
                    <Panel
                        ref={refs.leftPanelGroupRef}
                        id={PANEL_IDS.LEFT_GROUP}
                        minSize={PANEL_CONFIG.MIN_SIZE}
                        collapsible
                        onResize={handlers.handleResize}
                        onCollapse={() => handlers.handlePanelCollapse(StudyDisplayMode.TREE)}
                    >
                        <PanelGroup
                            autoSaveId={`study-left-panel-group-${studyUuid}`}
                            direction={state.leftGroupDirection}
                        >
                            {/* Tree Panel */}
                            <Panel ref={refs.treePanelRef} id={PANEL_IDS.TREE} minSize={PANEL_CONFIG.MIN_SIZE}>
                                <Box sx={styles.panelContent}>
                                    <ReactFlowProvider>
                                        <NetworkModificationTreePane
                                            studyUuid={studyUuid}
                                            studyMapTreeDisplay={studyDisplayMode}
                                            currentRootNetworkUuid={currentRootNetworkUuid}
                                            onTreePanelResize={refs.treePanelResizeHandlerRef}
                                        />
                                    </ReactFlowProvider>
                                </Box>
                            </Panel>

                            {/* Tree-Modifications Resize Handle */}
                            <ResizeHandle
                                visible={state.visibility.modificationsHandle}
                                rotated={state.leftGroupDirection === 'vertical'}
                            />

                            {/* Modifications Panel */}
                            <Panel
                                ref={refs.modificationsPanelRef}
                                id={PANEL_IDS.MODIFICATIONS}
                                minSize={
                                    state.leftGroupDirection === 'horizontal'
                                        ? state.modificationsPanelMinSize
                                        : PANEL_CONFIG.MIN_SIZE
                                }
                                maxSize={PANEL_CONFIG.MAX_SIZE}
                                collapsible
                                onResize={handlers.handleResize}
                                onCollapse={() => handlers.handlePanelCollapse(StudyDisplayMode.MODIFICATIONS)}
                            >
                                <Box sx={{ height: '100%' }}>{networkModificationComponent}</Box>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    {/* Left-Grid Resize Handle */}
                    <ResizeHandle visible={state.visibility.gridHandle} />

                    {/* Grid Panel */}
                    <Panel
                        ref={refs.gridPanelRef}
                        id={PANEL_IDS.GRID}
                        minSize={PANEL_CONFIG.MIN_SIZE}
                        collapsible
                        onCollapse={() => handlers.handlePanelCollapse(StudyDisplayMode.DIAGRAM_GRID_LAYOUT)}
                    >
                        <Box
                            sx={{
                                ...styles.panelContent,
                                paddingBottom: theme.spacing(1),
                                backgroundColor:
                                    theme.palette.mode === 'light'
                                        ? theme.palette.grey[300]
                                        : theme.palette.background.paper,
                            }}
                        >
                            <DiagramGridLayout
                                studyUuid={studyUuid}
                                visible={state.visibility.grid}
                                showInSpreadsheet={showInSpreadsheet}
                            />
                        </Box>
                    </Panel>
                </PanelGroup>
            </Box>
        </Box>
    );
};

export default MapViewer;
