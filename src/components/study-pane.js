/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';

import { useSelector } from 'react-redux';

import { darken } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { STUDY_DISPLAY_MODE } from '../redux/actions';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
} from '../utils/config-params';
import NetworkMapTab from './network-map-tab';
import { ReportViewerTab } from './report-viewer-tab';
import { ResultViewTab } from './result-view-tab';
import TabPanelLazy from './results/common/tab-panel-lazy';
import { DiagramPane } from './diagrams/diagram-pane';
import HorizontalToolbar from './horizontal-toolbar';
import NetworkModificationTreePane from './network-modification-tree-pane';
import { ReactFlowProvider } from 'react-flow-renderer';
import { DiagramType, useDiagram } from './diagrams/diagram-common';
import { isNodeBuilt } from './graph/util/model-functions';
import TableWrapper from './spreadsheet/table-wrapper';
import { ComputingType } from './computing-status/computing-type';

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

const StudyPane = ({ studyUuid, currentNode, setErrorMessage, ...props }) => {
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

    const [isComputationRunning, setIsComputationRunning] = useState(false);

    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
        changed: false,
    });

    const loadFlowStatus = useSelector(
        (state) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const classes = useStyles();

    const { openDiagramView } = useDiagram();

    const disabled = !isNodeBuilt(currentNode);

    function openVoltageLevelDiagram(vlId) {
        // TODO code factorization for displaying a VL via a hook
        if (vlId) {
            props.onChangeTab(0); // switch to map view
            openDiagramView(vlId, DiagramType.VOLTAGE_LEVEL);
        }
    }

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
                        <div
                            style={{
                                display:
                                    studyDisplayMode === STUDY_DISPLAY_MODE.MAP
                                        ? 'none'
                                        : null,
                                width:
                                    studyDisplayMode ===
                                    STUDY_DISPLAY_MODE.HYBRID
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
                                    studyDisplayMode === STUDY_DISPLAY_MODE.TREE
                                        ? 'none'
                                        : null,
                                width:
                                    studyDisplayMode ===
                                    STUDY_DISPLAY_MODE.HYBRID
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
                                    openVoltageLevel={openVoltageLevel}
                                    /* TODO verif tableEquipment*/
                                    currentNode={currentNode}
                                    onChangeTab={props.onChangeTab}
                                    showInSpreadsheet={showInSpreadsheet}
                                    setIsComputationRunning={
                                        setIsComputationRunning
                                    }
                                    setErrorMessage={setErrorMessage}
                                    loadFlowStatus={loadFlowStatus}
                                />
                            </div>

                            <DiagramPane
                                studyUuid={studyUuid}
                                isComputationRunning={isComputationRunning}
                                showInSpreadsheet={showInSpreadsheet}
                                currentNode={currentNode}
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
                <TableWrapper
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    equipmentId={tableEquipment.id}
                    equipmentType={tableEquipment.type}
                    equipmentChanged={tableEquipment.changed}
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
            <TabPanelLazy
                key={`spreadsheet-${currentNode?.id}`}
                className="singlestretch-child"
                selected={props.view === StudyView.SPREADSHEET}
            >
                {renderTableView()}
            </TabPanelLazy>
            {/* using a key in this tappanellazy because we can change the nodeuuid in this component */}
            <TabPanelLazy
                key={`results-${currentNode?.id}`}
                className="singlestretch-child"
                selected={props.view === StudyView.RESULTS}
            >
                <ResultViewTab
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                    disabled={disabled}
                />
            </TabPanelLazy>
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
