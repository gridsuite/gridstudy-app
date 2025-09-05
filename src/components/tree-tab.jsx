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
import GridLayoutPanel from './grid-layout/grid-layout-panel';
import NodeEditor from './graph/menus/network-modifications/node-editor';
import ScenarioEditor from './graph/menus/dynamic-simulation/scenario-editor';
import ResizeHandle from './resize-handle';

import { usePanelManager } from '../hooks/use-panel-manager';
import { PANEL_CONFIG, PANEL_IDS } from '../constants/panel.constants';
import { StudyDisplayMode } from './network-modification.type';

const styles = {
    table: { display: 'flex', flexDirection: 'column', height: '100%' },
    gridAndTreeContainer: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden' },
    panelContent: { display: 'flex', flexGrow: 1, height: '100%' },
};

const TreeTab = ({
    studyUuid,
    currentRootNetworkUuid,
    tableEquipment,
    onTableEquipementChanged,
    onChangeTab,
    showGrid,
}) => {
    const theme = useTheme();
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const isNetworkModificationTreeModelUpToDate = useSelector((state) => state.isNetworkModificationTreeModelUpToDate);

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
        () => (state.visibility.eventScenario ? <ScenarioEditor /> : <NodeEditor />),
        [state.visibility.eventScenario]
    );

    return (
        <Box sx={styles.table}>
            <Box sx={styles.gridAndTreeContainer}>
                <WaitingLoader message="LoadingRemoteData" loading={!isNetworkModificationTreeModelUpToDate} />
                <PanelGroup autoSaveId={`study-panels-${studyUuid}`} direction="horizontal">
                    {/* Left Panel Group */}
                    <Panel
                        ref={refs.treeAndModificationsPanelGroupRef}
                        id={PANEL_IDS.TREE_AND_MODIFICATIONS_GROUP}
                        minSize={PANEL_CONFIG.MIN_SIZE}
                        collapsible
                        onResize={handlers.handleResize}
                        onCollapse={() => handlers.handlePanelCollapse(StudyDisplayMode.TREE)}
                        onExpand={() => handlers.handlePanelExpand(StudyDisplayMode.TREE)}
                    >
                        <PanelGroup
                            autoSaveId={`study-left-panel-group-${studyUuid}`}
                            direction={state.treeAndModificationsGroupDirection}
                        >
                            {/* Tree Panel */}
                            <Panel ref={refs.treePanelRef} id={PANEL_IDS.TREE} minSize={PANEL_CONFIG.MIN_SIZE}>
                                <Box sx={styles.panelContent}>
                                    <ReactFlowProvider>
                                        <NetworkModificationTreePane
                                            studyUuid={studyUuid}
                                            studyMapTreeDisplay={studyDisplayMode}
                                            currentRootNetworkUuid={currentRootNetworkUuid}
                                            onTreePanelResize={refs.onTreePanelResizeHandlerRef}
                                        />
                                    </ReactFlowProvider>
                                </Box>
                            </Panel>

                            {/* Tree-Modifications Resize Handle */}
                            <ResizeHandle
                                visible={state.visibility.modificationsResizeHandle}
                                rotated={state.treeAndModificationsGroupDirection === 'vertical'}
                            />

                            {/* Modifications Panel */}
                            <Panel
                                ref={refs.modificationsPanelRef}
                                id={PANEL_IDS.MODIFICATIONS}
                                minSize={
                                    state.treeAndModificationsGroupDirection === 'horizontal'
                                        ? state.modificationsPanelMinSize
                                        : PANEL_CONFIG.MIN_SIZE
                                }
                                maxSize={PANEL_CONFIG.MAX_SIZE}
                                collapsible
                                onResize={handlers.handleResize}
                                onCollapse={() =>
                                    handlers.handlePanelCollapse(
                                        state.visibility.eventScenario
                                            ? StudyDisplayMode.EVENT_SCENARIO
                                            : StudyDisplayMode.MODIFICATIONS
                                    )
                                }
                                onExpand={() =>
                                    handlers.handlePanelExpand(
                                        state.visibility.eventScenario
                                            ? StudyDisplayMode.EVENT_SCENARIO
                                            : StudyDisplayMode.MODIFICATIONS
                                    )
                                }
                            >
                                <Box sx={{ height: '100%' }}>{networkModificationComponent}</Box>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    {/* Left-Grid Resize Handle */}
                    <ResizeHandle visible={state.visibility.gridResizeHandle} />

                    {/* Grid Panel */}
                    <Panel
                        ref={refs.gridPanelRef}
                        id={PANEL_IDS.GRID}
                        minSize={PANEL_CONFIG.MIN_SIZE}
                        collapsible
                        onCollapse={() => handlers.handlePanelCollapse(StudyDisplayMode.GRID_LAYOUT_PANEL)}
                        onExpand={() => handlers.handlePanelExpand(StudyDisplayMode.GRID_LAYOUT_PANEL)}
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
                            <GridLayoutPanel
                                studyUuid={studyUuid}
                                visible={state.visibility.grid}
                                showInSpreadsheet={showInSpreadsheet}
                                showGrid={showGrid}
                            />
                        </Box>
                    </Panel>
                </PanelGroup>
            </Box>
        </Box>
    );
};

export default TreeTab;
