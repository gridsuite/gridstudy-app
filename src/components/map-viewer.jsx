/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
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
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { Typography } from '@mui/material';
import { EQUIPMENT_TYPES } from './utils/equipment-types.js';

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
    drawInfo: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: '1em',
        pointerEvents: 'none', // Allow selecting components below
    },
    instructionsMessage: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        overflowWrap: 'break-word',
        textAlign: 'center',
    },
};
const MapViewer = ({
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
    const intl = useIntl();
    const dispatch = useDispatch();
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const { snackInfo, snackError } = useSnackMessage();
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

    useEffect(() => {
        //display a snackbar
        if (isDrawingMode) {
            snackInfo({
                messageTxt: intl.formatMessage({
                    id: 'DrawingPolygonInstruction',
                }),
            });
        }
    }, [isDrawingMode, intl, snackInfo]);

    function getMapWitdh(displayMode) {
        if (displayMode === STUDY_DISPLAY_MODE.DRAW) {
            return '80%';
        } else {
            return '100%';
        }
    }
    const onCancelFunction = useCallback(() => {
        networkMapref.current.cleanDraw();
        dispatch(setStudyDisplayMode(STUDY_DISPLAY_MODE.MAP));
    }, [dispatch]);
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
                                        onDrawPolygonModeActive={(active) => {
                                            if (active === true) {
                                                dispatch(
                                                    setStudyDisplayMode(
                                                        STUDY_DISPLAY_MODE.MAP
                                                    )
                                                );
                                            }
                                            setIsDrawingMode(active);
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
                            {isDrawingMode && (
                                <Box style={styles.drawInfo}>
                                    <Typography
                                        style={styles.instructionsMessage}
                                    >
                                        {intl.formatMessage({
                                            id: 'DrawingPolygonInstruction',
                                        })}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        {studyDisplayMode === STUDY_DISPLAY_MODE.DRAW && (
                            <Box
                                style={{
                                    display:
                                        studyDisplayMode !==
                                        STUDY_DISPLAY_MODE.DRAW
                                            ? 'none'
                                            : null,
                                }}
                            >
                                <FilterCreationPanel
                                    onSaveFilter={async (filter, distDir) => {
                                        try {
                                            //we want to calculate selectedLine or selectedSubstation only when needed
                                            //call getSelectedLines if the user want to create a filter with lines
                                            //for all others case we call getSelectedSubstations
                                            const selectedEquipments =
                                                filter.equipmentType ===
                                                EQUIPMENT_TYPES.LINE
                                                    ? networkMapref.current.getSelectedLines()
                                                    : networkMapref.current.getSelectedSubstations();
                                            const selectedEquipmentsIds =
                                                selectedEquipments.map(
                                                    (eq) => eq.id
                                                );
                                            if (
                                                selectedEquipments.length === 0
                                            ) {
                                                snackError({
                                                    messageTxt:
                                                        'No substations selected',
                                                    headerId:
                                                        'FilterCreationError',
                                                });
                                                return;
                                            }
                                            await createMapFilter(
                                                filter,
                                                distDir,
                                                studyUuid,
                                                currentNode.id,
                                                selectedEquipmentsIds
                                            );
                                            snackInfo({
                                                messageTxt: intl.formatMessage(
                                                    {
                                                        id: 'FilterCreationSuccess',
                                                    },
                                                    {
                                                        filterName: filter.name,
                                                    }
                                                ),
                                            });
                                        } catch (error) {
                                            snackError({
                                                messageTxt: error.message,
                                                headerId: 'FilterCreationError',
                                            });
                                        }
                                    }}
                                    onCancel={onCancelFunction}
                                ></FilterCreationPanel>
                            </Box>
                        )}
                    </div>
                </div>
            </Box>
        </ReactFlowProvider>
    );
};

export default MapViewer;
