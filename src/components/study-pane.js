/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { darken } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {
    filteredNominalVoltagesUpdated,
    STUDY_DISPLAY_MODE,
} from '../redux/actions';
import Paper from '@mui/material/Paper';
import { equipments } from './network/network-equipments';
import PropTypes from 'prop-types';
import NetworkTable from './network/network-table';
import clsx from 'clsx';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
} from '../utils/config-params';
import { getLoadFlowRunningStatus } from './util/running-status';
import NetworkMapTab from './network-map-tab';
import { ReportViewerTab } from './report-viewer-tab';
import { ResultViewTab } from './result-view-tab';
import { DiagramPane } from './diagrams/diagram-pane';
import HorizontalToolbar from './horizontal-toolbar';
import NetworkModificationTreePane from './network-modification-tree-pane';
import { ReactFlowProvider } from 'react-flow-renderer';
import { SvgType, useDiagram } from './diagrams/diagram-common';
import { isNodeBuilt } from './graph/util/model-functions';
import { ResizableBox } from 'react-resizable';
import ResizePanelHandleIcon from '@mui/icons-material/MoreVert';
import { useWindowDimensions } from '@gridsuite/commons-ui';

const useStyles = makeStyles((theme) => ({
    map: {
        display: 'flex',
        flexDirection: 'row',
    },
    horizontalToolbar: {
        backgroundColor: darken(theme.palette.background.paper, 0.2),
    },
    error: {
        padding: theme.spacing(2),
    },
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
    mapCtrlBottomLeft: {
        '& .mapboxgl-ctrl-bottom-left': {
            transition: theme.transitions.create('left', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
    },
    resizablePanel: {
        position: 'relative',
        '& .react-resizable-handle': {
            position: 'absolute',
            width: theme.spacing(0.5),
            height: '100%',
            top: 0,
            right: 0,
            cursor: 'col-resize',
            backgroundColor: theme.palette.action.disabled,
        },
    },
    innerResizablePanel: {
        flex: 'auto',
        height: '100%',
        paddingRight: theme.spacing(0.5),
    },
    resizePanelHandleIcon: {
        bottom: '50%',
        right: theme.spacing(-1.25),
        position: 'absolute',
        color: theme.palette.text.disabled,
        transform: 'scale(0.5, 1.5)',
    },
}));

export const StudyView = {
    MAP: 'Map',
    SPREADSHEET: 'Spreadsheet',
    RESULTS: 'Results',
    LOGS: 'Logs',
};

const StudyPane = ({
    studyUuid,
    network,
    currentNode,
    loadFlowInfos,
    securityAnalysisStatus,
    sensiStatus,
    shortCircuitStatus,
    runnable,
    setErrorMessage,
    ...props
}) => {
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

    const filteredNominalVoltages = useSelector(
        (state) => state.filteredNominalVoltages
    );

    const [isComputationRunning, setIsComputationRunning] = useState(false);

    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
        changed: false,
    });

    const dispatch = useDispatch();

    const classes = useStyles();

    const { openDiagramView } = useDiagram();

    const disabled = !isNodeBuilt(currentNode);

    const { windowWidth } = useWindowDimensions();

    useEffect(() => {
        if (
            network &&
            network.substations.length > 0 &&
            !filteredNominalVoltages
        ) {
            dispatch(
                filteredNominalVoltagesUpdated(network.getNominalVoltages())
            );
        }
    }, [network, filteredNominalVoltages, dispatch]);

    function openVoltageLevelDiagram(vlId) {
        // TODO code factorization for displaying a VL via a hook
        if (vlId) {
            props.onChangeTab(0); // switch to map view
            openDiagramView(vlId, SvgType.VOLTAGE_LEVEL);
        }
    }

    const openVoltageLevel = useCallback(
        (vlId) => {
            if (!network) return;
            openDiagramView(vlId, SvgType.VOLTAGE_LEVEL);
        },
        [network, openDiagramView]
    );

    useEffect(() => {
        if (!network) return;
        network.useEquipment(equipments.substations);
        network.useEquipment(equipments.lines);
    }, [network]);

    function showInSpreadsheet(equipment) {
        let newTableEquipment = {
            id: equipment.equipmentId,
            type: equipment.equipmentType,
            changed: !tableEquipment.changed,
        };
        setTableEquipment(newTableEquipment);
        props.onChangeTab(1); // switch to spreadsheet view
    }

    function renderMapView() {
        return (
            <ReactFlowProvider>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <div
                        className={classes.horizontalToolbar}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                        }}
                    >
                        <HorizontalToolbar />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: 1,
                            overflow: 'hidden',
                        }}
                    >
                        {studyDisplayMode === STUDY_DISPLAY_MODE.HYBRID ? (
                            <ResizableBox
                                height={'100%'}
                                width={windowWidth / 2} // By default, the tree panel takes half of the screen
                                className={classes.resizablePanel}
                                minConstraints={[windowWidth * 0.2]}
                                maxConstraints={[windowWidth * 0.8]}
                                resizeHandles={['e']}
                                axis={'x'}
                            >
                                <div className={classes.innerResizablePanel}>
                                    <NetworkModificationTreePane
                                        studyUuid={studyUuid}
                                        studyMapTreeDisplay={studyDisplayMode}
                                    />
                                    <ResizePanelHandleIcon
                                        className={
                                            // TODO CHARLY rendre la handle un peu plus large, mais pas forcément visiblement plus large.
                                            classes.resizePanelHandleIcon
                                        }
                                    />
                                </div>
                            </ResizableBox>
                        ) : (
                            <div
                                style={{
                                    display:
                                        studyDisplayMode ===
                                        STUDY_DISPLAY_MODE.MAP
                                            ? 'none'
                                            : null,
                                    width: '100%',
                                }}
                            >
                                <NetworkModificationTreePane
                                    studyUuid={studyUuid}
                                    studyMapTreeDisplay={studyDisplayMode}
                                />
                            </div>
                        )}
                        <div
                            className={clsx(
                                'relative singlestretch-child',
                                classes.map
                            )}
                            style={{
                                flex: 'auto',
                                display:
                                    studyDisplayMode === STUDY_DISPLAY_MODE.TREE
                                        ? 'none'
                                        : null,
                            }}
                        >
                            <div
                                className={classes.mapCtrlBottomLeft}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                }}
                            >
                                {/* TODO do not display if study does not exists or do not fetch geoData if study does not exists */}
                                <NetworkMapTab
                                    /* TODO do we move redux param to container */
                                    studyUuid={studyUuid}
                                    visible={
                                        props.view === StudyView.MAP &&
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
                                    filteredNominalVoltages={
                                        filteredNominalVoltages
                                    }
                                    openVoltageLevel={openVoltageLevel}
                                    /* TODO verif tableEquipment*/
                                    currentNode={currentNode}
                                    onChangeTab={props.onChangeTab}
                                    showInSpreadsheet={showInSpreadsheet}
                                    loadFlowStatus={getLoadFlowRunningStatus(
                                        loadFlowInfos?.loadFlowStatus
                                    )}
                                    securityAnalysisStatus={
                                        securityAnalysisStatus
                                    }
                                    sensiStatus={sensiStatus}
                                    shortCircuitStatus={shortCircuitStatus}
                                    setIsComputationRunning={
                                        setIsComputationRunning
                                    }
                                    runnable={runnable}
                                    setErrorMessage={setErrorMessage}
                                />
                            </div>

                            <DiagramPane
                                studyUuid={studyUuid}
                                network={network}
                                isComputationRunning={isComputationRunning}
                                showInSpreadsheet={showInSpreadsheet}
                                loadFlowStatus={getLoadFlowRunningStatus(
                                    loadFlowInfos?.loadFlowStatus
                                )}
                                currentNode={currentNode}
                                disabled={disabled}
                                visible={
                                    props.view === StudyView.MAP &&
                                    studyDisplayMode !== STUDY_DISPLAY_MODE.TREE
                                }
                            />
                        </div>
                    </div>
                </div>
            </ReactFlowProvider>
        );
    }

    function renderTableView() {
        return (
            <Paper className={clsx('singlestretch-child', classes.table)}>
                <NetworkTable
                    network={network}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    equipmentId={tableEquipment.id}
                    equipmentType={tableEquipment.type}
                    equipmentChanged={tableEquipment.changed}
                    loadFlowStatus={getLoadFlowRunningStatus(
                        loadFlowInfos?.loadFlowStatus
                    )}
                    disabled={disabled}
                    visible={props.view === StudyView.SPREADSHEET}
                />
            </Paper>
        );
    }

    return (
        <>
            {/*Rendering the map is slow, do it once and keep it display:none*/}
            <div
                className="singlestretch-child"
                style={{
                    display: props.view === StudyView.MAP ? null : 'none',
                }}
            >
                {renderMapView()}
            </div>
            <div
                className="singlestretch-child"
                style={{
                    display:
                        props.view === StudyView.SPREADSHEET ? null : 'none',
                }}
            >
                {renderTableView()}
            </div>
            <div
                className="singlestretch-child"
                style={{
                    display: props.view === StudyView.RESULTS ? null : 'none',
                }}
            >
                <ResultViewTab
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    loadFlowInfos={loadFlowInfos}
                    network={network}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                    disabled={disabled}
                />
            </div>
            <div
                className="singlestretch-child"
                style={{
                    display: props.view === StudyView.LOGS ? null : 'none',
                }}
            >
                <ReportViewerTab
                    studyId={studyUuid}
                    visible={props.view === StudyView.LOGS}
                    currentNode={currentNode}
                    disabled={disabled}
                />
            </div>
        </>
    );
};

StudyPane.defaultProps = {
    view: StudyView.MAP,
    lineFlowAlertThreshold: 100,
};

StudyPane.propTypes = {
    view: PropTypes.oneOf(Object.values(StudyView)).isRequired,
    lineFlowAlertThreshold: PropTypes.number.isRequired,
    onChangeTab: PropTypes.func,
};

export default StudyPane;
