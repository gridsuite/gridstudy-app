/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';

import { useSelector } from 'react-redux';

import { darken } from '@mui/material/styles';
import { STUDY_DISPLAY_MODE } from '../redux/actions';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
} from '../utils/config-params';
import NetworkMapTab from './network/network-map-tab';
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
import { Box } from '@mui/system';
import ParametersTabs from './parameters-tabs';

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
    error: (theme) => ({
        padding: theme.spacing(2),
    }),
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
};

export const StudyView = {
    MAP: 'Map',
    SPREADSHEET: 'Spreadsheet',
    RESULTS: 'Results',
    LOGS: 'Logs',
    PARAMETERS: 'Parameters',
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

    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
        changed: false,
    });

    const oneBusShortCircuitStatus = useSelector(
        (state) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

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
                        <Box
                            sx={styles.map}
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
                            <Box sx={styles.mapBelowDiagrams}>
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
                                    setErrorMessage={setErrorMessage}
                                />
                            </Box>

                            <DiagramPane
                                studyUuid={studyUuid}
                                showInSpreadsheet={showInSpreadsheet}
                                currentNode={currentNode}
                                visible={
                                    props.view === StudyView.MAP &&
                                    studyDisplayMode !== STUDY_DISPLAY_MODE.TREE
                                }
                                oneBusShortCircuitStatus={
                                    oneBusShortCircuitStatus
                                }
                            />
                        </Box>
                    </div>
                </Box>
            </ReactFlowProvider>
        );
    }

    function renderTableView() {
        return (
            <Paper sx={styles.table}>
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
            {/* using a key in these TabPanelLazy because we can change the nodeUuid in this component */}
            <TabPanelLazy
                key={`spreadsheet-${currentNode?.id}`}
                selected={props.view === StudyView.SPREADSHEET}
            >
                {renderTableView()}
            </TabPanelLazy>

            <Box
                sx={{
                    height: '100%',
                    flexDirection: 'column',
                    display: props.view === StudyView.RESULTS ? 'flex' : 'none',
                }}
            >
                <TabPanelLazy
                    key={`results-${currentNode?.id}`}
                    selected={props.view === StudyView.RESULTS}
                >
                    <ResultViewTab
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        openVoltageLevelDiagram={openVoltageLevelDiagram}
                        disabled={disabled}
                        view={props.view}
                    />
                </TabPanelLazy>
            </Box>
            <TabPanelLazy
                selected={props.view === StudyView.LOGS}
                key={`logs-${currentNode?.id}`}
            >
                <ReportViewerTab
                    studyId={studyUuid}
                    visible={props.view === StudyView.LOGS}
                    currentNode={currentNode}
                    disabled={disabled}
                />
            </TabPanelLazy>
            <TabPanelLazy
                key={`parameters-${currentNode?.id}`}
                selected={props.view === StudyView.PARAMETERS}
            >
                <ParametersTabs studyId={studyUuid} />
            </TabPanelLazy>
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
