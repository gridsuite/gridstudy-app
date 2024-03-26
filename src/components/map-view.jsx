/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
} from '../utils/config-params.js';
import { setStudyDisplayMode, STUDY_DISPLAY_MODE } from '../redux/actions.js';
import { DiagramType } from './diagrams/diagram-common.js';
import { ReactFlowProvider } from 'react-flow-renderer';
import { Box } from '@mui/system';
import HorizontalToolbar from './horizontal-toolbar.jsx';
import NetworkModificationTreePane from './network-modification-tree-pane.jsx';
import NetworkMapTab from './network/network-map-tab.jsx';
import { DiagramPane } from './diagrams/diagram-pane.jsx';
import FilterCreationPanel from './network/filter-creation-panel';
import { createMapFilter } from '../services/study/network-map.js';
import { StudyView } from './study-pane.jsx';
import { darken } from '@mui/material/styles';
import ComputingType from './computing-status/computing-type';

const styles = {
    map: {
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
    },
    horizontalToolbar: (theme) => ({
        backgroundColor: darken(theme.palette.background.paper, 0.2),
        display: 'flex',
        flexDirection: 'row',
    }),
    error: (theme) => ({
        padding: theme.spacing(2),
    }),
    rotate: {
        animation: 'spin 1000ms infinite',
    },
    '@global': {
        '@keyframes spin': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(-360deg)',
            },
        },
    },
    mapBelowDiagrams: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
};
const MapView = ({
    studyUuid,
    currentNode,
    view,
    openDiagramView,
    tableEquipment,
    onTableEquipementChanged,
    onChangeTab,
    setErrorMessage,
}) => {
    const networkMapref = useRef(null); // hold the reference to the network map (from powsybl-diagram-viewer)
    const dispatch = useDispatch();
    const lineFullPath = useSelector((state) => state[PARAM_LINE_FULL_PATH]);
    const lineParallelPath = useSelector(
        (state) => state[PARAM_LINE_PARALLEL_PATH]
    );

    const lineFlowMode = useSelector((state) => state[PARAM_LINE_FLOW_MODE]);

    const lineFlowColorMode = useSelector(
        (state) => state[PARAM_LINE_FLOW_COLOR_MODE]
    );

    const lineFlowAlertThreshold = useSelector((state) =>
        Number(state[PARAM_LINE_FLOW_ALERT_THRESHOLD])
    );

    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);

    function setDrawDisplay() {
        dispatch(setStudyDisplayMode(STUDY_DISPLAY_MODE.DRAW));
    }

    const oneBusShortCircuitStatus = useSelector(
        (state) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    const openVoltageLevel = useCallback(
        (vlId) => {
            openDiagramView(vlId, DiagramType.VOLTAGE_LEVEL);
        },
        [openDiagramView]
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

    function getMapWitdh(displayMode) {
        if (displayMode === STUDY_DISPLAY_MODE.DRAW) {
            return '80%';
        } else {
            return '100%';
        }
    }
    const onCancelFunction = useCallback(() => {
        console.log('debug', networkMapref);
    }, []);
    return (
        <ReactFlowProvider>
            <Box sx={styles.table}>
                <Box sx={styles.horizontalToolbar}>
                    <HorizontalToolbar />
                </Box>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: 1,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display:
                                studyDisplayMode === STUDY_DISPLAY_MODE.MAP ||
                                studyDisplayMode === STUDY_DISPLAY_MODE.DRAW
                                    ? 'none'
                                    : null,
                            width: getMapWitdh(studyDisplayMode),
                        }}
                    >
                        <NetworkModificationTreePane
                            studyUuid={studyUuid}
                            studyMapTreeDisplay={studyDisplayMode}
                        />
                    </div>
                    <div
                        style={{
                            display:
                                studyDisplayMode === STUDY_DISPLAY_MODE.TREE
                                    ? 'none'
                                    : 'flex',
                            flexDirection: 'row',
                            flexGrow: 1,
                            width: '100%',
                        }}
                    >
                        <Box
                            sx={styles.map}
                            style={{
                                display:
                                    studyDisplayMode === STUDY_DISPLAY_MODE.TREE
                                        ? 'none'
                                        : null,
                                width: getMapWitdh(studyDisplayMode),
                            }}
                        >
                            <Box>
                                <Box sx={styles.mapBelowDiagrams}>
                                    <NetworkMapTab
                                        networkMapRef={networkMapref}
                                        /* TODO do we move redux param to container */
                                        studyUuid={studyUuid}
                                        visible={
                                            view === StudyView.MAP &&
                                            studyDisplayMode !==
                                                STUDY_DISPLAY_MODE.TREE
                                        }
                                        lineFullPath={lineFullPath}
                                        lineParallelPath={lineParallelPath}
                                        lineFlowMode={lineFlowMode}
                                        lineFlowColorMode={lineFlowColorMode}
                                        lineFlowAlertThreshold={
                                            lineFlowAlertThreshold
                                        }
                                        openVoltageLevel={openVoltageLevel}
                                        /* TODO verif tableEquipment*/
                                        currentNode={currentNode}
                                        onChangeTab={onChangeTab}
                                        showInSpreadsheet={showInSpreadsheet}
                                        setErrorMessage={setErrorMessage}
                                        onDrawModeChanged={(drawMode) => {
                                            if (drawMode) {
                                                setDrawDisplay();
                                            }
                                        }}
                                    ></NetworkMapTab>
                                </Box>
                            </Box>

                            <DiagramPane
                                studyUuid={studyUuid}
                                showInSpreadsheet={showInSpreadsheet}
                                currentNode={currentNode}
                                visible={
                                    view === StudyView.MAP &&
                                    studyDisplayMode !== STUDY_DISPLAY_MODE.TREE
                                }
                                oneBusShortCircuitStatus={
                                    oneBusShortCircuitStatus
                                }
                            />
                        </Box>

                        <Box
                            style={{
                                display:
                                    studyDisplayMode !== STUDY_DISPLAY_MODE.DRAW
                                        ? 'none'
                                        : null,
                            }}
                        >
                            <FilterCreationPanel
                                onSaveFilter={async (filter, distDir) => {
                                    try {
                                        await createMapFilter(
                                            filter,
                                            distDir,
                                            studyUuid,
                                            currentNode.id,
                                            networkMapref
                                        );
                                    } catch (e) {
                                        console.log('debug', 'error', e);
                                    }
                                }}
                                onCancel={onCancelFunction}
                            ></FilterCreationPanel>
                        </Box>
                    </div>
                </div>
            </Box>
        </ReactFlowProvider>
    );
};

export default MapView;
