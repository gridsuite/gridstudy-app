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
import { DRAW_EVENT, DRAW_MODES } from '@powsybl/diagram-viewer';
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
import { EQUIPMENT_TYPES } from './utils/equipment-types.js';

import { Global, css } from '@emotion/react';

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
    const { snackInfo, snackError, snackWarning, closeSnackbar } =
        useSnackMessage();
    const lineFullPath = useSelector((state) => state[PARAM_LINE_FULL_PATH]);
    const lineParallelPath = useSelector(
        (state) => state[PARAM_LINE_PARALLEL_PATH]
    );
    const [shouldOpenFilterCreationPanel, setShouldOpenFilterCreationPanel] =
        useState(false);

    const lineFlowMode = useSelector((state) => state[PARAM_LINE_FLOW_MODE]);

    const lineFlowColorMode = useSelector(
        (state) => state[PARAM_LINE_FLOW_COLOR_MODE]
    );

    const lineFlowAlertThreshold = useSelector((state) =>
        Number(state[PARAM_LINE_FLOW_ALERT_THRESHOLD])
    );

    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);

    const oneBusShortCircuitStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]
    );
    const previousStudyDisplayMode = useRef(undefined);
    const isInDrawingMode = previousStudyDisplayMode.current !== undefined;

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

    const [instructionSnakbar, setInstructionSnackbar] = useState(undefined);
    useEffect(() => {
        //display a snackbar
        if (drawingMode === DRAW_MODES.DRAW_POLYGON && !instructionSnakbar) {
            setInstructionSnackbar(
                snackInfo({
                    messageTxt: intl.formatMessage({
                        id: 'DrawingPolygonInstruction',
                    }),
                    persist: true,
                })
            );
        }
        if (drawingMode === DRAW_MODES.SIMPLE_SELECT && instructionSnakbar) {
            closeSnackbar(instructionSnakbar);
            setInstructionSnackbar(undefined);
        }
    }, [drawingMode, intl, snackInfo, instructionSnakbar, closeSnackbar]);

    const onSaveFilter = useCallback(
        async (filter, distDir, setIsLoading) => {
            setIsLoading(true);
            try {
                //we want to calculate selectedLine or selectedSubstation only when needed
                //call getSelectedLines if the user want to create a filter with lines
                //for all others case we call getSelectedSubstations
                const selectedEquipments =
                    filter.equipmentType === EQUIPMENT_TYPES.LINE
                        ? networkMapref.current.getSelectedLines()
                        : networkMapref.current.getSelectedSubstations();
                const selectedEquipmentsIds = selectedEquipments.map(
                    (eq) => eq.id
                );
                if (selectedEquipments.length === 0) {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: 'FilterCreationIgnored',
                    });
                } else {
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
                }
            } catch (error) {
                snackError({
                    messageTxt: intl.formatMessage({
                        id: error.message,
                    }),
                    headerId: 'FilterCreationError',
                });
            }
            setIsLoading(false);
        },
        [currentNode?.id, intl, snackError, snackInfo, snackWarning, studyUuid]
    );

    const navigateToPreviousDisplayMode = useCallback(() => {
        setShouldOpenFilterCreationPanel(false);
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
        if (
            drawingMode === DRAW_MODES.DRAW_POLYGON &&
            isPolygonDrawn === false
        ) {
            // save the previous mode so we can restore it when the user cancel the drawing
            if (!isInDrawingMode) {
                previousStudyDisplayMode.current = studyDisplayMode;
            }
            //go to map full screen mode
            dispatch(setStudyDisplayMode(STUDY_DISPLAY_MODE.MAP));
        }
        // the user has a polygon, and want to draw another
        else if (
            drawingMode === DRAW_MODES.DRAW_POLYGON &&
            isPolygonDrawn === true
        ) {
            if (
                networkMapref.current.getMapDrawer()?.getAll().features
                    ?.length > 1
            ) {
                setShouldOpenFilterCreationPanel(false);
                const idFirstPolygon = networkMapref.current
                    .getMapDrawer()
                    .getAll().features[0].id;
                networkMapref.current
                    .getMapDrawer()
                    .delete(String(idFirstPolygon));
            }
        }
        // transition between Drawing polygon mode -> cancel the drawing and return to previous display mode
        else if (
            drawingMode === DRAW_MODES.SIMPLE_SELECT &&
            isPolygonDrawn === false
        ) {
            navigateToPreviousDisplayMode();
        }
    }, [
        dispatch,
        drawingMode,
        navigateToPreviousDisplayMode,
        studyDisplayMode,
        isInDrawingMode,
    ]);

    const onDrawEvent = useCallback((event) => {
        switch (event) {
            case DRAW_EVENT.DELETE:
                setShouldOpenFilterCreationPanel(false);
                break;
            case DRAW_EVENT.CREATE:
                setShouldOpenFilterCreationPanel(true);
                break;
            case DRAW_EVENT.UPDATE:
                break;
            default:
                break;
        }
    }, []);

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
                            studyDisplayMode === STUDY_DISPLAY_MODE.TREE ||
                            studyDisplayMode === STUDY_DISPLAY_MODE.HYBRID
                                ? 'flex'
                                : 'none',
                        height: '100%',
                        flexBasis:
                            studyDisplayMode === STUDY_DISPLAY_MODE.HYBRID
                                ? '50%'
                                : '100%',
                    }}
                >
                    <ReactFlowProvider>
                        <NetworkModificationTreePane
                            studyUuid={studyUuid}
                            studyMapTreeDisplay={studyDisplayMode}
                        />
                    </ReactFlowProvider>
                </Box>
                {/* Map */}
                <Box
                    style={{
                        display:
                            studyDisplayMode !== STUDY_DISPLAY_MODE.TREE
                                ? 'flex'
                                : 'none',
                        flexBasis:
                            studyDisplayMode === STUDY_DISPLAY_MODE.HYBRID
                                ? '50%'
                                : '100%',
                        height: '100%',
                    }}
                >
                    <Box
                        style={{
                            width: '100%',
                        }}
                    >
                        {/* TODO make filter panel take only 20% */}
                        <Box style={styles.map}>
                            <Box
                                style={{
                                    position: 'absolute',
                                    width: shouldOpenFilterCreationPanel
                                        ? '80%'
                                        : '100%',
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
                                    currentNode={currentNode}
                                    onChangeTab={onChangeTab}
                                    showInSpreadsheet={showInSpreadsheet}
                                    setErrorMessage={setErrorMessage}
                                    onDrawPolygonModeActive={onDrawingModeEnter}
                                    onPolygonChanged={() => {}}
                                    onDrawEvent={onDrawEvent}
                                ></NetworkMapTab>
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
                                hidden={isInDrawingMode}
                            />

                            <Box
                                style={{
                                    width: shouldOpenFilterCreationPanel
                                        ? '20%'
                                        : '0%',
                                    height: '100%',
                                    position: 'absolute',
                                    right: 0,
                                }}
                            >
                                {shouldOpenFilterCreationPanel && (
                                    <FilterCreationPanel
                                        onSaveFilter={onSaveFilter}
                                        onCancel={() => {
                                            setShouldOpenFilterCreationPanel(
                                                false
                                            );
                                        }}
                                    ></FilterCreationPanel>
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
