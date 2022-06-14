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
    openNetworkAreaDiagram,
} from '../redux/actions';
import { equipments } from './network/network-equipments';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import NetworkTable from './network/network-table';
import clsx from 'clsx';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_USE_NAME,
} from '../utils/config-params';
import { getLoadFlowRunningStatus } from './util/running-status';
import NetworkMapTab from './network-map-tab';
import { MapLateralDrawers } from './map-lateral-drawers';
import { ReportViewerTab } from './report-viewer-tab';
import { ResultViewTab } from './result-view-tab';
import { SingleLineDiagramPane } from './diagrams/singleLineDiagram/single-line-diagram-pane';
import HorizontalToolbar from './horizontal-toolbar';
import NetworkModificationTreePane from './network-modification-tree-pane';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useSingleLineDiagram } from './diagrams/singleLineDiagram/utils';
import { NetworkAreaDiagramPane } from './diagrams/networkAreaDiagram/network-area-diagram-pane';

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
    flexResizer: {
        flex: '0 0 4px',
        background: theme.palette.text.secondary,
        cursor: 'ew-resize',
    },
}));

export const StudyView = {
    MAP: 'Map',
    SPREADSHEET: 'Spreadsheet',
    RESULTS: 'Results',
    LOGS: 'Logs',
};

export const StudyDisplayMode = {
    MAP: 'Map',
    TREE: 'Tree',
    HYBRID: 'Hybrid',
};

const StudyPane = ({
    studyUuid,
    network,
    workingNode,
    selectedNode,
    updatedLines,
    loadFlowInfos,
    securityAnalysisStatus,
    runnable,
    setUpdateSwitchMsg,
    setErrorMessage,
    ...props
}) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);

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

    const [studyDisplayMode, setStudyDisplayMode] = useState(
        StudyDisplayMode.HYBRID
    );

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

    const [closeVoltageLevelDiagram, showVoltageLevelDiagram] =
        useSingleLineDiagram(studyUuid);

    const openedNad = useSelector((state) => state.openNetworkAreaDiagram);

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

    function openVoltageLevelDiagram(vlId, substationId) {
        // TODO code factorization for displaying a VL via a hook
        if (vlId) {
            props.onChangeTab(0); // switch to map view
            showVoltageLevelDiagram(vlId); // show voltage level
        }
    }

    const openVoltageLevel = useCallback(
        (vlId) => {
            if (!network) return;
            showVoltageLevelDiagram(vlId);
        },
        [network, showVoltageLevelDiagram]
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

    // Prototype / WIP :
    // Resizer adapted from http://jsfiddle.net/6j10L3x2
    function manageResize(md, sizeProp, posProp) {
        let r = md.target;

        let prev = r.previousElementSibling;
        let next = r.nextElementSibling;
        if (!prev || !next) {
            return;
        }

        md.preventDefault();

        let prevSize = prev[sizeProp];
        let nextSize = next[sizeProp];
        let sumSize = prevSize + nextSize;
        let prevGrow = Number(prev.style.flexGrow);
        let nextGrow = Number(next.style.flexGrow);
        let sumGrow = prevGrow + nextGrow;
        let lastPos = md[posProp];

        function onMouseMove(mm) {
            let pos = mm[posProp];
            let d = pos - lastPos;
            prevSize += d;
            nextSize -= d;
            if (prevSize < 0) {
                nextSize += prevSize;
                pos -= prevSize;
                prevSize = 0;
            }
            if (nextSize < 0) {
                prevSize += nextSize;
                pos += nextSize;
                nextSize = 0;
            }

            let prevGrowNew = sumGrow * (prevSize / sumSize);
            let nextGrowNew = sumGrow * (nextSize / sumSize);

            prev.style.flexGrow = prevGrowNew;
            next.style.flexGrow = nextGrowNew;

            lastPos = pos;
        }

        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
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
                        <HorizontalToolbar
                            setStudyDisplayMode={setStudyDisplayMode}
                            studyDisplayMode={studyDisplayMode}
                        />
                    </div>
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
                                flex:
                                    studyDisplayMode === StudyDisplayMode.HYBRID
                                        ? '1'
                                        : null,
                                display:
                                    studyDisplayMode === StudyDisplayMode.MAP
                                        ? 'none'
                                        : null,
                                width:
                                    studyDisplayMode === StudyDisplayMode.HYBRID
                                        ? '50%'
                                        : '100%',
                            }}
                        >
                            <NetworkModificationTreePane
                                studyUuid={studyUuid}
                                studyMapTreeDisplay={studyDisplayMode}
                            />
                        </div>
                        {studyDisplayMode === StudyDisplayMode.HYBRID && (
                            <div
                                onMouseDown={(event) =>
                                    manageResize(event, 'scrollWidth', 'pageX')
                                }
                                className={classes.flexResizer}
                            ></div>
                        )}
                        <div
                            className={clsx(
                                'relative singlestretch-child',
                                classes.map
                            )}
                            style={{
                                flex:
                                    studyDisplayMode === StudyDisplayMode.HYBRID
                                        ? '1'
                                        : null,
                                display:
                                    studyDisplayMode === StudyDisplayMode.TREE
                                        ? 'none'
                                        : null,
                                width:
                                    studyDisplayMode === StudyDisplayMode.HYBRID
                                        ? '50%'
                                        : '100%',
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
                                    network={network}
                                    visible={props.view === StudyView.MAP}
                                    updatedLines={updatedLines}
                                    useName={useName}
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
                                    workingNode={workingNode}
                                    selectedNode={selectedNode}
                                    onChangeTab={props.onChangeTab}
                                    showInSpreadsheet={showInSpreadsheet}
                                    loadFlowStatus={getLoadFlowRunningStatus(
                                        loadFlowInfos?.loadFlowStatus
                                    )}
                                    securityAnalysisStatus={
                                        securityAnalysisStatus
                                    }
                                    setIsComputationRunning={
                                        setIsComputationRunning
                                    }
                                    runnable={runnable}
                                    setErrorMessage={setErrorMessage}
                                />
                            </div>

                            <MapLateralDrawers />

                            {/*
                Rendering single line diagram only in map view and if
                displayed voltage level or substation id has been set
                */}
                            {props.view === StudyView.MAP && (
                                <SingleLineDiagramPane
                                    studyUuid={studyUuid}
                                    network={network}
                                    onClose={closeVoltageLevelDiagram}
                                    openVoltageLevel={openVoltageLevel}
                                    isComputationRunning={isComputationRunning}
                                    showInSpreadsheet={showInSpreadsheet}
                                    loadFlowStatus={getLoadFlowRunningStatus(
                                        loadFlowInfos?.loadFlowStatus
                                    )}
                                    workingNode={workingNode}
                                    selectedNode={selectedNode}
                                />
                            )}
                            {props.view === StudyView.MAP && openedNad && (
                                <NetworkAreaDiagramPane
                                    studyUuid={studyUuid}
                                    network={network}
                                    workingNode={workingNode}
                                    selectedNode={selectedNode}
                                    loadFlowStatus={getLoadFlowRunningStatus(
                                        loadFlowInfos?.loadFlowStatus
                                    )}
                                    onClose={() =>
                                        dispatch(
                                            openNetworkAreaDiagram(undefined)
                                        )
                                    }
                                />
                            )}
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
                    workingNode={workingNode}
                    selectedNode={selectedNode}
                    equipmentId={tableEquipment.id}
                    equipmentType={tableEquipment.type}
                    equipmentChanged={tableEquipment.changed}
                    loadFlowStatus={getLoadFlowRunningStatus(
                        loadFlowInfos?.loadFlowStatus
                    )}
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
                    workingNode={workingNode}
                    selectedNode={selectedNode}
                    loadFlowInfos={loadFlowInfos}
                    network={network}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
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
                    workingNode={workingNode}
                    selectedNode={selectedNode}
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
