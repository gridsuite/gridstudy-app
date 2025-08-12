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
import { Box, useTheme } from '@mui/material';
import { StudyView } from './utils/utils';
import { DiagramType } from './diagrams/diagram.type';
import WaitingLoader from './utils/waiting-loader';
import DiagramGridLayout from './diagrams/diagram-grid-layout';

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
    const theme = useTheme();
    const dispatch = useDispatch();

    const networkVisuParams = useSelector((state) => state.networkVisualizationsParameters);
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const isNetworkModificationTreeModelUpToDate = useSelector((state) => state.isNetworkModificationTreeModelUpToDate);
    const toggleOptions = useSelector((state) => state.toggleOptions);

    const openVoltageLevel = useCallback(
        (vlId) => {
            dispatch(openDiagram(vlId, DiagramType.VOLTAGE_LEVEL));
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
                        display: toggleOptions.includes(StudyDisplayMode.TREE) ? 'flex' : 'none',
                        flexGrow: 1,
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
                        display: toggleOptions.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT) ? 'flex' : 'none',
                        flexGrow: 1,
                        // Hack to put a padding at bottom of the diagram grid layout,
                        paddingBottom: theme.spacing(1),
                        backgroundColor:
                            theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.background.paper,
                        // end of hack
                    }}
                >
                    <DiagramGridLayout
                        studyUuid={studyUuid}
                        visible={toggleOptions.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT)}
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
                        flexGrow: 1,
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
                                <NetworkMapTab
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
                                    onPolygonChanged={() => {}}
                                ></NetworkMapTab>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default MapViewer;
