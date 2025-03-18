/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStudyDisplayMode } from '../redux/actions';
import { DRAW_EVENT, DRAW_MODES } from '@powsybl/network-viewer';
import { ReactFlowProvider } from '@xyflow/react';
import HorizontalToolbar from './horizontal-toolbar';
import NetworkModificationTreePane from './network-modification-tree-pane';
import NetworkMapTab from './network/network-map-tab';
import { DiagramPane } from './diagrams/diagram-pane';
import { darken } from '@mui/material/styles';

import { Global, css } from '@emotion/react';
import { EQUIPMENT_TYPES } from './utils/equipment-types';
import SelectionCreationPanel from './network/selection-creation-panel/selection-creation-panel';
import { StudyDisplayMode } from './network-modification.type';
import GuidancePopup from './network/guidance-popup';
import { Button, Typography, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import BackHandOutlinedIcon from '@mui/icons-material/BackHandOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import { StudyView } from './utils/utils';
import { DiagramType } from './diagrams/diagram.type';
import WaitingLoader from './utils/waiting-loader';

const styles = {
    map: {
        display: 'flex',
        position: 'relative',
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
    popUpContent: (theme) => ({
        fontSize: 15,
        fontFamily: theme.typography.fontFamily,
    }),
    symbol: (theme) => ({
        width: theme.spacing(2),
        height: theme.spacing(2),
    }),
    title: (theme) => ({
        lineHeight: 1,
        maxWidth: theme.spacing(17.5),
    }),
};
//define guidancePopup style
const guidancePopupStyle = {
    card: (theme) => ({
        position: 'absolute',
        left: theme.spacing(1.25),
        bottom: theme.spacing(18.75),
        maxWidth: theme.spacing(25),
    }),
    header: (theme) => ({
        paddingBottom: theme.spacing(1.4),
    }),
    actionsContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
};

// define the guidancePopup title and content
export const Title = () => (
    <Typography variant="h6" component="div" sx={styles.title}>
        <FormattedMessage id="guidancePopUp.title" />
    </Typography>
);
export const Content = () => (
    <>
        <Typography variant="body2" sx={styles.popUpContent}>
            <FormattedMessage
                id="guidancePopUp.firstVariant"
                values={{
                    symbol: <BackHandOutlinedIcon sx={styles.symbol} />,
                }}
            />
        </Typography>
        <Typography variant="body2" sx={styles.popUpContent}>
            <FormattedMessage
                id={'guidancePopUp.secondVariant'}
                values={{
                    symbol: <KeyboardReturnOutlinedIcon sx={styles.symbol} />,
                }}
            />
        </Typography>
    </>
);

const MapViewer = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    view,
    openDiagramView,
    tableEquipment,
    onTableEquipementChanged,
    onChangeTab,
}) => {
    const networkMapref = useRef(null); // hold the reference to the network map (from powsybl-network-viewer)
    const dispatch = useDispatch();
    const [drawingMode, setDrawingMode] = useState(DRAW_MODES.SIMPLE_SELECT);
    const [shouldOpenSelectionCreationPanel, setShouldOpenSelectionCreationPanel] = useState(false);
    const [nominalVoltages, setNominalVoltages] = useState();
    const [isInDrawingMode, setIsInDrawingMode] = useState(false);

    const networkVisuParams = useSelector((state) => state.networkVisualizationsParameters);
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const previousStudyDisplayMode = useRef(undefined);
    const isNetworkModificationTreeModelUpToDate = useSelector((state) => state.isNetworkModificationTreeModelUpToDate);

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

    const onDrawingModeEnter = useCallback((active) => {
        setDrawingMode(active);
    }, []);

    const leaveDrawingMode = useCallback(() => {
        // clear the user drawing and go back to simple select.
        networkMapref.current.getMapDrawer()?.trash();
        setDrawingMode(DRAW_MODES.SIMPLE_SELECT);
        // leave drawing mode and go back to the previous study display mode and close the creation panel if it's open
        dispatch(setStudyDisplayMode(previousStudyDisplayMode.current));
        setIsInDrawingMode(false);
        previousStudyDisplayMode.current = undefined;
        if (shouldOpenSelectionCreationPanel) {
            setShouldOpenSelectionCreationPanel(false);
        }
    }, [dispatch, shouldOpenSelectionCreationPanel]);

    // When the user enter the drawing mode, we need to switch the study display mode to map
    // and save the previous mode, so we can restore it when the user cancel the drawing
    useEffect(() => {
        const all = networkMapref.current?.getMapDrawer()?.getAll();
        if (all === undefined) {
            return;
        } // map is not initialized yet

        const features = all?.features?.[0];
        const coordinates = features?.geometry?.coordinates;
        const isPolygonDrawn = coordinates?.[0]?.length > 3;

        // first click on draw button, the polygon is not drawn yet, and the user want to draw
        if (drawingMode === DRAW_MODES.DRAW_POLYGON && isPolygonDrawn === false) {
            if (!isInDrawingMode) {
                // save the previous display mode, so we can restore it when the user cancel the drawing
                if (!previousStudyDisplayMode.current) {
                    previousStudyDisplayMode.current = studyDisplayMode;
                }
                setIsInDrawingMode(true);
                //go to map full screen mode
                dispatch(setStudyDisplayMode(StudyDisplayMode.MAP));
            }
        }
        // the user has a polygon, and want to draw another
        else if (drawingMode === DRAW_MODES.DRAW_POLYGON && isPolygonDrawn === true) {
            if (networkMapref.current.getMapDrawer()?.getAll().features?.length > 1) {
                setShouldOpenSelectionCreationPanel(false);
                const idFirstPolygon = networkMapref.current.getMapDrawer().getAll().features[0].id;
                networkMapref.current.getMapDrawer().delete(String(idFirstPolygon));
            }
        }
    }, [dispatch, drawingMode, studyDisplayMode, isInDrawingMode]);

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
                {/* Waiting for map geodata is unnecessary. The map has is proper loader implementation */}
                {/* This WaitingLoader is placed here to block functionnalities, hiding under components with some opacity*/}
                <WaitingLoader message={'LoadingRemoteData'} loading={!isNetworkModificationTreeModelUpToDate} />
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
                        <NetworkModificationTreePane
                            studyUuid={studyUuid}
                            studyMapTreeDisplay={studyDisplayMode}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                        />
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
                                {isInDrawingMode && (
                                    // hack to override the bg-color of the draw button when we enter in draw mode
                                    <Global
                                        styles={css`
                                            .mapbox-gl-draw_polygon {
                                                background-color: lightblue !important;
                                            }
                                        `}
                                    />
                                )}

                                <NetworkMapTab
                                    networkMapRef={networkMapref}
                                    studyUuid={studyUuid}
                                    visible={view === StudyView.MAP && studyDisplayMode !== StudyDisplayMode.TREE}
                                    lineFullPath={networkVisuParams.mapParameters.lineFullPath}
                                    lineParallelPath={networkVisuParams.mapParameters.lineParallelPath}
                                    lineFlowMode={networkVisuParams.mapParameters.lineFlowMode}
                                    lineFlowColorMode={networkVisuParams.mapParameters.lineFlowColorMode}
                                    lineFlowAlertThreshold={networkVisuParams.mapParameters.lineFlowAlertThreshold}
                                    openVoltageLevel={openVoltageLevel}
                                    currentNode={currentNode}
                                    currentRootNetworkUuid={currentRootNetworkUuid}
                                    onChangeTab={onChangeTab}
                                    showInSpreadsheet={showInSpreadsheet}
                                    onDrawPolygonModeActive={onDrawingModeEnter}
                                    onPolygonChanged={() => {}}
                                    onDrawEvent={onDrawEvent}
                                    isInDrawingMode={isInDrawingMode}
                                    onNominalVoltagesChange={setNominalVoltages}
                                ></NetworkMapTab>
                                {isInDrawingMode && studyDisplayMode === StudyDisplayMode.MAP && (
                                    <GuidancePopup
                                        title={<Title />}
                                        content={<Content />}
                                        actions={
                                            <Button size="small" onClick={leaveDrawingMode}>
                                                <FormattedMessage id="guidancePopUp.action" />
                                            </Button>
                                        }
                                        styles={guidancePopupStyle}
                                    />
                                )}
                            </Box>

                            <DiagramPane
                                studyUuid={studyUuid}
                                showInSpreadsheet={showInSpreadsheet}
                                currentNode={currentNode}
                                currentRootNetworkUuid={currentRootNetworkUuid}
                                visible={
                                    !isInDrawingMode &&
                                    view === StudyView.MAP &&
                                    studyDisplayMode !== StudyDisplayMode.TREE
                                }
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
                                        leaveDrawingMode={leaveDrawingMode}
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
