/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { darken, makeStyles } from '@material-ui/core/styles';
import { filteredNominalVoltagesUpdated } from '../redux/actions';
import { equipments } from './network/network-equipments';
import Paper from '@material-ui/core/Paper';
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
    PARAM_MAP_TREE_DISPLAY,
} from '../utils/config-params';
import { getLoadFlowRunningStatus } from './util/running-status';
import NetworkMapTab from './network-map-tab';
import {
    DRAWER_EXPLORER_WIDTH,
    DRAWER_NODE_EDITOR_WIDTH,
    MapLateralDrawers,
} from './map-lateral-drawers';
import { ReportViewerTab } from './report-viewer-tab';
import { ResultViewTab } from './result-view-tab';
import {
    SingleLineDiagramPane,
    useSingleLineDiagram,
} from './single-line-diagram-pane';
import HorizontalToolbar from './horizontal-toobar';
import NetworkModificationTreePane from './network-modification-tree-pane';
import { useParameterState } from './parameters';
import { ReactFlowProvider } from 'react-flow-renderer';

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
    workingNodeUuid,
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

    const [studyDisplayMode, setStudyDisplayMode] = useParameterState(
        PARAM_MAP_TREE_DISPLAY
    );

    const filteredNominalVoltages = useSelector(
        (state) => state.filteredNominalVoltages
    );

    const [isComputationRunning, setIsComputationRunning] = useState(false);

    const [visibleSubstation, setVisibleSubstation] = useState(null);

    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
        changed: false,
    });

    const [centerOnSubstation, setCenterOnSubstation] = useState();

    const dispatch = useDispatch();

    const classes = useStyles();

    const [
        closeVoltageLevelDiagram,
        showVoltageLevelDiagram,
        showSubstationDiagram,
    ] = useSingleLineDiagram(studyUuid);

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

    const [drawerShift, setDrawerShift] = useState(0);

    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );

    const isExplorerDrawerOpen = useSelector(
        (state) => state.isExplorerDrawerOpen
    );

    useEffect(() => {
        let shift = 0;
        if (isExplorerDrawerOpen) shift += DRAWER_EXPLORER_WIDTH;
        if (
            isModificationsDrawerOpen &&
            studyDisplayMode === StudyDisplayMode.MAP
        ) {
            shift += DRAWER_NODE_EDITOR_WIDTH;
        }
        setDrawerShift(shift);
    }, [
        setDrawerShift,
        isExplorerDrawerOpen,
        isModificationsDrawerOpen,
        studyDisplayMode,
    ]);

    function openVoltageLevelDiagram(vlId, substationId) {
        // TODO code factorization for displaying a VL via a hook
        if (vlId) {
            props.onChangeTab(0); // switch to map view
            showVoltageLevelDiagram(vlId); // show voltage level
            setVisibleSubstation(substationId);
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
                                    left: drawerShift,
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
                                    centerOnSubstation={centerOnSubstation}
                                    /* TODO verif tableEquipment*/
                                    selectedNodeUuid={workingNodeUuid}
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

                            <MapLateralDrawers
                                network={network}
                                studyDisplayMode={studyDisplayMode}
                                onVoltageLevelDisplayClick={
                                    showVoltageLevelDiagram
                                }
                                onSubstationDisplayClick={showSubstationDiagram}
                                onSubstationFocus={setCenterOnSubstation}
                                visibleSubstation={visibleSubstation}
                            />

                            {/*
                Rendering single line diagram only in map view and if
                displayed voltage level or substation id has been set
                */}
                            {props.view === StudyView.MAP && (
                                <SingleLineDiagramPane
                                    studyUuid={studyUuid}
                                    network={network}
                                    onClose={() => closeVoltageLevelDiagram()}
                                    openVoltageLevel={openVoltageLevel}
                                    isComputationRunning={isComputationRunning}
                                    showInSpreadsheet={showInSpreadsheet}
                                    loadFlowStatus={getLoadFlowRunningStatus(
                                        loadFlowInfos?.loadFlowStatus
                                    )}
                                    selectedNodeUuid={workingNodeUuid}
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
                    selectedNodeUuid={workingNodeUuid}
                    equipmentId={tableEquipment.id}
                    equipmentType={tableEquipment.type}
                    equipmentChanged={tableEquipment.changed}
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
                    selectedNodeUuid={workingNodeUuid}
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
                    reportId={studyUuid}
                    visible={props.view === StudyView.LOGS}
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
