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
} from '../utils/config-params';
import { setStudyDisplayMode } from '../redux/actions';
import { DRAW_EVENT, DRAW_MODES } from '@powsybl/diagram-viewer';
import { DiagramType } from './diagrams/diagram-common';
import { ReactFlowProvider } from 'react-flow-renderer';
import { Box } from '@mui/system';
import HorizontalToolbar from './horizontal-toolbar';
import NetworkModificationTreePane from './network-modification-tree-pane';
import NetworkMapTab from './network/network-map-tab';
import { DiagramPane } from './diagrams/diagram-pane';
import { StudyView } from './study-pane';
import { darken } from '@mui/material/styles';
import ComputingType from './computing-status/computing-type';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { Global, css } from '@emotion/react';
import { EQUIPMENT_TYPES } from './utils/equipment-types';
import SelectionCreationPanel from './network/selection-creation-panel';
import { StudyDisplayMode } from './network-modification.type';

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
    const [drawingMode, setDrawingMode] = useState(DRAW_MODES.SIMPLE_SELECT);
    const { snackInfo, closeSnackbar } = useSnackMessage();
    const lineFullPath = useSelector((state) => state[PARAM_LINE_FULL_PATH]);
    const lineParallelPath = useSelector((state) => state[PARAM_LINE_PARALLEL_PATH]);
    const [shouldOpenSelectionCreationPanel, setShouldOpenSelectionCreationPanel] = useState(false);

    const lineFlowMode = useSelector((state) => state[PARAM_LINE_FLOW_MODE]);

    const lineFlowColorMode = useSelector((state) => state[PARAM_LINE_FLOW_COLOR_MODE]);

    const lineFlowAlertThreshold = useSelector((state) => Number(state[PARAM_LINE_FLOW_ALERT_THRESHOLD]));

    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);

    const oneBusShortCircuitStatus = useSelector((state) => state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]);
    const previousStudyDisplayMode = useRef(undefined);
    const isInDrawingMode = previousStudyDisplayMode.current !== undefined;

    const [nominalVoltages, setNominalVoltages] = useState();

    const openVoltageLevel = useCallback(
        (vlId) => {
            // don't open the sld if the drawing mode is activated
            if (!isInDrawingMode) {
                openDiagramView(vlId, DiagramType.VOLTAGE_LEVEL);
            }
        },
        [openDiagramView, isInDrawingMode]
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

    const [instructionSnackbar, setInstructionSnackbar] = useState(undefined);
    useEffect(() => {
        //display a snackbar
        if (drawingMode === DRAW_MODES.DRAW_POLYGON && !instructionSnackbar) {
            setInstructionSnackbar(
                snackInfo({
                    messageTxt: intl.formatMessage({
                        id: 'DrawingPolygonInstruction',
                    }),
                    persist: true,
                })
            );
        }
        if (drawingMode === DRAW_MODES.SIMPLE_SELECT && instructionSnackbar) {
            closeSnackbar(instructionSnackbar);
            setInstructionSnackbar(undefined);
        }
    }, [drawingMode, intl, snackInfo, instructionSnackbar, closeSnackbar]);

    const navigateToPreviousDisplayMode = useCallback(() => {
        setShouldOpenSelectionCreationPanel(false);
        if (isInDrawingMode) {
            dispatch(setStudyDisplayMode(previousStudyDisplayMode.current));
            previousStudyDisplayMode.current = undefined;
        }
    }, [dispatch, isInDrawingMode]);

    const onDrawingModeEnter = useCallback((active) => {
        setDrawingMode(active);
    }, []);

    // When the user enter the drawing mode, we need to switch the study display mode to map
    // and save the previous mode so we can restore it when the user cancel the drawing
    useEffect(() => {
        const all = networkMapref.current?.getMapDrawer()?.getAll();
        if (all === undefined) {
            return;
        } // map is not initialized yet

        const features = all?.features?.[0];
        const coordinates = features?.geometry?.coordinates;
        const isPolygonDrawn = coordinates?.[0]?.length > 3;

        // fitst click on draw button, the polygon is not drawn yet, and the user want to draw
        if (drawingMode === DRAW_MODES.DRAW_POLYGON && isPolygonDrawn === false) {
            // save the previous mode so we can restore it when the user cancel the drawing
            if (!isInDrawingMode) {
                previousStudyDisplayMode.current = studyDisplayMode;
            }
            //go to map full screen mode
            dispatch(setStudyDisplayMode(StudyDisplayMode.MAP));
        }
        // the user has a polygon, and want to draw another
        else if (drawingMode === DRAW_MODES.DRAW_POLYGON && isPolygonDrawn === true) {
            if (networkMapref.current.getMapDrawer()?.getAll().features?.length > 1) {
                setShouldOpenSelectionCreationPanel(false);
                const idFirstPolygon = networkMapref.current.getMapDrawer().getAll().features[0].id;
                networkMapref.current.getMapDrawer().delete(String(idFirstPolygon));
            }
        }
        // transition between Drawing polygon mode -> cancel the drawing and return to previous display mode
        else if (drawingMode === DRAW_MODES.SIMPLE_SELECT && isPolygonDrawn === false) {
            navigateToPreviousDisplayMode();
        }
    }, [dispatch, drawingMode, navigateToPreviousDisplayMode, studyDisplayMode, isInDrawingMode]);

    const onDrawEvent = useCallback((event) => {
        switch (event) {
            case DRAW_EVENT.DELETE:
                setShouldOpenSelectionCreationPanel(false);
                break;
            case DRAW_EVENT.CREATE:
                setShouldOpenSelectionCreationPanel(true);
                break;
            case DRAW_EVENT.UPDATE:
                break;
            default:
                break;
        }
    }, []);

    const getEquipments = (equipmentType) => {
        return equipmentType === EQUIPMENT_TYPES.LINE
            ? networkMapref.current.getSelectedLines()
            : networkMapref.current.getSelectedSubstations();
    };

    return (
        <Box sx={styles.table}>
            <Box sx={styles.horizontalToolbar}>
                <HorizontalToolbar />
            </Box>
            <Box sx={styles.mapAndTreeContainer}>
                {/* Tree */}
                <Box
                    sx={{
                        display:
                            studyDisplayMode === StudyDisplayMode.TREE || studyDisplayMode === StudyDisplayMode.HYBRID
                                ? 'flex'
                                : 'none',
                        height: '100%',
                        flexBasis: studyDisplayMode === StudyDisplayMode.HYBRID ? '50%' : '100%',
                    }}
                >
                    <ReactFlowProvider>
                        <NetworkModificationTreePane studyUuid={studyUuid} studyMapTreeDisplay={studyDisplayMode} />
                    </ReactFlowProvider>
                </Box>
                {/* Map */}
                <Box
                    sx={{
                        display: studyDisplayMode !== StudyDisplayMode.TREE ? 'flex' : 'none',
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
                                    width: shouldOpenSelectionCreationPanel ? '80%' : '100%',
                                    height: '100%',
                                }}
                            >
                                {isInDrawingMode ? (
                                    // hack to override the bg-color of the draw button when we enter in draw mode
                                    <Global
                                        styles={css`
                                            .mapbox-gl-draw_polygon {
                                                background-color: lightblue !important;
                                            }
                                        `}
                                    />
                                ) : null}
                                <NetworkMapTab
                                    networkMapRef={networkMapref}
                                    studyUuid={studyUuid}
                                    visible={view === StudyView.MAP && studyDisplayMode !== StudyDisplayMode.TREE}
                                    lineFullPath={lineFullPath}
                                    lineParallelPath={lineParallelPath}
                                    lineFlowMode={lineFlowMode}
                                    lineFlowColorMode={lineFlowColorMode}
                                    lineFlowAlertThreshold={lineFlowAlertThreshold}
                                    openVoltageLevel={openVoltageLevel}
                                    currentNode={currentNode}
                                    onChangeTab={onChangeTab}
                                    showInSpreadsheet={showInSpreadsheet}
                                    setErrorMessage={setErrorMessage}
                                    onDrawPolygonModeActive={onDrawingModeEnter}
                                    onPolygonChanged={() => {}}
                                    onDrawEvent={onDrawEvent}
                                    isInDrawingMode={isInDrawingMode}
                                    onNominalVoltagesChange={setNominalVoltages}
                                ></NetworkMapTab>
                            </Box>

                            <DiagramPane
                                studyUuid={studyUuid}
                                showInSpreadsheet={showInSpreadsheet}
                                currentNode={currentNode}
                                visible={
                                    !isInDrawingMode &&
                                    view === StudyView.MAP &&
                                    studyDisplayMode !== StudyDisplayMode.TREE
                                }
                                oneBusShortCircuitStatus={oneBusShortCircuitStatus}
                            />

                            <Box
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
                                        nominalVoltages={nominalVoltages}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default MapViewer;
