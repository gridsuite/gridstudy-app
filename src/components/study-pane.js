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
import { ReportViewerTab } from './report-viewer-tab';
import { ResultViewTab } from './result-view-tab';
import { SingleLineDiagramPane } from './diagrams/singleLineDiagram/single-line-diagram-pane';
import HorizontalToolbar from './horizontal-toolbar';
import NetworkModificationTreePane from './network-modification-tree-pane';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useSingleLineDiagram } from './diagrams/singleLineDiagram/utils';
import { NetworkAreaDiagramPane } from './diagrams/networkAreaDiagram/network-area-diagram-pane';
import { isNodeBuilt } from './graph/util/model-functions';

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
    currentNode,
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

    const voltageLevelsIdsForNad = useSelector(
        (state) => state.voltageLevelsIdsForNad
    );

    const nodeDisabled = !isNodeBuilt(currentNode);

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
                        <div
                            className={clsx(
                                'relative singlestretch-child',
                                classes.map
                            )}
                            style={{
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
                                    currentNode={currentNode}
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
                                    currentNode={currentNode}
                                    nodeDisabled={nodeDisabled}
                                />
                            )}
                            {props.view === StudyView.MAP &&
                                voltageLevelsIdsForNad?.length && (
                                    <NetworkAreaDiagramPane
                                        studyUuid={studyUuid}
                                        network={network}
                                        currentNode={currentNode}
                                        loadFlowStatus={getLoadFlowRunningStatus(
                                            loadFlowInfos?.loadFlowStatus
                                        )}
                                        onClose={() =>
                                            dispatch(openNetworkAreaDiagram([]))
                                        }
                                        nodeDisabled={nodeDisabled}
                                        align="left"
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
                    currentNode={currentNode}
                    equipmentId={tableEquipment.id}
                    equipmentType={tableEquipment.type}
                    equipmentChanged={tableEquipment.changed}
                    loadFlowStatus={getLoadFlowRunningStatus(
                        loadFlowInfos?.loadFlowStatus
                    )}
                    nodeDisabled={nodeDisabled}
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
                    nodeDisabled={nodeDisabled}
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
                    nodeDisabled={nodeDisabled}
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
