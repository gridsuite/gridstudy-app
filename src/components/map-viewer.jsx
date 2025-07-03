/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDiagram } from '../redux/actions';
import { ReactFlowProvider } from '@xyflow/react';
import NetworkModificationTreePane from './network-modification-tree-pane';
import NetworkMapTab from './network/network-map-tab';

import { StudyDisplayMode } from './network-modification.type';
import { StudyView } from './utils/utils';
import { DiagramType } from './diagrams/diagram.type';
import WaitingLoader from './utils/waiting-loader';
import DiagramGridLayout from './diagrams/diagram-grid-layout';
import { Box } from '@mui/material';

const styles = {
    map: {
        display: 'flex',
        position: 'relative',
        flexDirection: 'row',
        height: '100%',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    mapAndTreeContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
    },
};

const MapViewer = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    view,
    tableEquipment,
    onTableEquipementChanged,
    onChangeTab,
}) => {
    const dispatch = useDispatch();

    const networkVisuParams = useSelector((state) => state.networkVisualizationsParameters);
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const isNetworkModificationTreeModelUpToDate = useSelector((state) => state.isNetworkModificationTreeModelUpToDate);

    const openVoltageLevel = useCallback(
        (vlId) => {
            // don't open the sld if the drawing mode is activated
            // if (!isInDrawingMode) {
            dispatch(openDiagram(vlId, DiagramType.VOLTAGE_LEVEL));
            // }
        },
        [dispatch]
    );

    function showInSpreadsheet(equipment) {
        let newTableEquipment = {
            id: equipment.equipmentId,
            type: equipment.equipmentType,
            changed: !tableEquipment.changed,
        };
        onTableEquipementChanged(newTableEquipment);
        onChangeTab(1); // switch to spreadsheet view
    }

    return (
        <Box sx={styles.table}>
            <Box sx={styles.mapAndTreeContainer}>
                {/* Waiting for map geodata is unnecessary. The map has is proper loader implementation */}
                {/* This WaitingLoader is placed here to block functionnalities, hiding under components with some opacity*/}
                <WaitingLoader message={'LoadingRemoteData'} loading={!isNetworkModificationTreeModelUpToDate} />
                {/* Tree */}
                <Box
                    sx={{
                        display:
                            studyDisplayMode === StudyDisplayMode.TREE ||
                            studyDisplayMode === StudyDisplayMode.HYBRID ||
                            studyDisplayMode === StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE
                                ? 'flex'
                                : 'none',
                        height: '100%',
                        flexBasis:
                            studyDisplayMode === StudyDisplayMode.HYBRID ||
                            studyDisplayMode === StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE
                                ? '50%'
                                : '100%',
                    }}
                >
                    <ReactFlowProvider>
                        <NetworkModificationTreePane
                            studyUuid={studyUuid}
                            studyMapTreeDisplay={studyDisplayMode}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                        />
                    </ReactFlowProvider>
                </Box>
                {/* Diagram Grid Layout */}
                <Box
                    sx={{
                        display:
                            studyDisplayMode === StudyDisplayMode.DIAGRAM_GRID_LAYOUT ||
                            studyDisplayMode === StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE
                                ? 'flex'
                                : 'none',
                        height: '100%',
                        flexDirection: 'column',
                        flexBasis: studyDisplayMode === StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE ? '50%' : '100%',
                    }}
                >
                    <DiagramGridLayout
                        studyUuid={studyUuid}
                        visible={
                            studyDisplayMode === StudyDisplayMode.DIAGRAM_GRID_LAYOUT ||
                            studyDisplayMode === StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE
                        }
                        showInSpreadsheet={showInSpreadsheet}
                    />
                </Box>
                {/* Map */}
                <Box
                    sx={{
                        display:
                            studyDisplayMode === StudyDisplayMode.MAP || studyDisplayMode === StudyDisplayMode.HYBRID
                                ? 'flex'
                                : 'none',
                        flexBasis: studyDisplayMode === StudyDisplayMode.HYBRID ? '50%' : '100%',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                        }}
                    >
                        {/* TODO make filter panel take only 20% */}
                        <Box sx={styles.map}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                {/* {isInDrawingMode && (
                                    // hack to override the bg-color of the draw button when we enter in draw mode
                                    <Global
                                        styles={css`
                                            .mapbox-gl-draw_polygon {
                                                background-color: lightblue !important;
                                            }
                                        `}
                                    />
                                )} */}

                                <NetworkMapTab
                                    // networkMapRef={networkMapref}
                                    studyUuid={studyUuid}
                                    visible={view === StudyView.TREE && studyDisplayMode !== StudyDisplayMode.TREE}
                                    lineFullPath={networkVisuParams.mapParameters.lineFullPath}
                                    lineParallelPath={networkVisuParams.mapParameters.lineParallelPath}
                                    lineFlowMode={networkVisuParams.mapParameters.lineFlowMode}
                                    openVoltageLevel={openVoltageLevel}
                                    currentNode={currentNode}
                                    currentRootNetworkUuid={currentRootNetworkUuid}
                                    onChangeTab={onChangeTab}
                                    showInSpreadsheet={showInSpreadsheet}
                                    // onDrawPolygonModeActive={onDrawingModeEnter}
                                    onPolygonChanged={() => {}}
                                    // onDrawEvent={onDrawEvent}
                                    // isInDrawingMode={isInDrawingMode}
                                    // onNominalVoltagesChange={setNominalVoltages}
                                ></NetworkMapTab>
                            </Box>

                            {/* <Box
                                sx={{
                                    width: shouldOpenSelectionCreationPanel ? '20%' : '0%',
                                    height: '100%',
                                    position: 'absolute',
                                    right: 0,
                                }}
                            >
                                {shouldOpenSelectionCreationPanel && (
                                    <SelectionCreationPanel
                                        getEquipments={getEquipments}
                                        onCancel={() => {
                                            setShouldOpenSelectionCreationPanel(false);
                                        }}
                                        leaveDrawingMode={leaveDrawingMode}
                                        nominalVoltages={nominalVoltages}
                                    />
                                )}
                            </Box> */}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default MapViewer;
