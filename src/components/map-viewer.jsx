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
import { DRAW_EVENT } from '@powsybl/diagram-viewer';
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
        (state) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );
    const [previousStudyDisplayMode, setPreviousStudyDisplayMode] =
        useState(undefined);
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
        if (isDrawingMode && !instructionSnakbar) {
            setInstructionSnackbar(
                snackInfo({
                    messageTxt: intl.formatMessage({
                        id: 'DrawingPolygonInstruction',
                    }),
                    persistent: true,
                })
            );
        }
        if (!isDrawingMode && instructionSnakbar) {
            closeSnackbar(instructionSnakbar);
            setInstructionSnackbar(undefined);
        }
    }, [isDrawingMode, intl, snackInfo, instructionSnakbar, closeSnackbar]);

    const onDrawingModeEnter = useCallback(
        (active) => {
            // save the previous mode so we can restore it when the user cancel the drawing
            if (previousStudyDisplayMode === undefined) {
                setPreviousStudyDisplayMode(studyDisplayMode);
            }
            if (active === true) {
                dispatch(setStudyDisplayMode(STUDY_DISPLAY_MODE.MAP));
            }
            setIsDrawingMode(active);
        },
        [dispatch, previousStudyDisplayMode, studyDisplayMode]
    );

    const onCancelFunction = useCallback(() => {
        networkMapref.current.cleanDraw();
        if (previousStudyDisplayMode !== undefined) {
            dispatch(setStudyDisplayMode(previousStudyDisplayMode));
            setPreviousStudyDisplayMode(undefined);
        }
    }, [dispatch, previousStudyDisplayMode]);

    return (
        <Box sx={styles.table}>
            <Box sx={styles.horizontalToolbar}>
                <HorizontalToolbar />
            </Box>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflow: 'hidden',
                    width: '100%',
                    height: '100%',
                }}
            >
                {/* Tree */}
                <div
                    style={{
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
                </div>
                {/* Map */}
                <div
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
                        <Box
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            <Box
                                style={{
                                    position: 'relative',
                                    width: shouldOpenFilterCreationPanel
                                        ? '80%'
                                        : '100%',
                                    height: '100%',
                                }}
                            >
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
                                    onDrawEvent={(event) => {
                                        switch (event) {
                                            case DRAW_EVENT.DELETE:
                                                setShouldOpenFilterCreationPanel(
                                                    false
                                                );
                                                break;
                                            case DRAW_EVENT.CREATE:
                                                setShouldOpenFilterCreationPanel(
                                                    true
                                                );
                                                break;
                                            case DRAW_EVENT.UPDATE:
                                                break;
                                            default:
                                                break;
                                        }
                                    }}
                                ></NetworkMapTab>
                            </Box>

                            <Box
                                style={{
                                    width: shouldOpenFilterCreationPanel
                                        ? '20%'
                                        : '0%',
                                    height: '100%',
                                }}
                            >
                                {shouldOpenFilterCreationPanel && (
                                    <FilterCreationPanel
                                        onSaveFilter={async (
                                            filter,
                                            distDir
                                        ) => {
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
                                                    selectedEquipments.length ===
                                                    0
                                                ) {
                                                    snackWarning({
                                                        messageTxt:
                                                            intl.formatMessage({
                                                                id: 'EmptySelection',
                                                            }),
                                                        headerId:
                                                            'FilterCreationIgnored',
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
                                                    messageTxt:
                                                        intl.formatMessage(
                                                            {
                                                                id: 'FilterCreationSuccess',
                                                            },
                                                            {
                                                                filterName:
                                                                    filter.name,
                                                            }
                                                        ),
                                                });
                                            } catch (error) {
                                                snackError({
                                                    messageTxt:
                                                        intl.formatMessage({
                                                            id: error.message,
                                                        }),
                                                    headerId:
                                                        'FilterCreationError',
                                                });
                                            }
                                        }}
                                        onCancel={onCancelFunction}
                                    ></FilterCreationPanel>
                                )}
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
                            oneBusShortCircuitStatus={oneBusShortCircuitStatus}
                        />
                    </Box>
                </div>
            </div>
        </Box>
    );
};

export default MapViewer;
