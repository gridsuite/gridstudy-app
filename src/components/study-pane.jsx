/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { ReportViewerTab } from './report-viewer-tab';
import { ResultViewTab } from './result-view-tab';
import TabPanelLazy from './results/common/tab-panel-lazy';
import { DiagramType, useDiagram } from './diagrams/diagram-common';
import { isNodeBuilt } from './graph/util/model-functions';
import TableWrapper from './spreadsheet/table-wrapper';
import { Box } from '@mui/system';
import ParametersTabs from './parameters-tabs';
import MapViewer from './map-viewer';

const styles = {
    map: {
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
    },
    error: (theme) => ({
        padding: theme.spacing(2),
    }),
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
    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
        changed: false,
    });

    const { openDiagramView } = useDiagram();

    const disabled = !isNodeBuilt(currentNode);

    function openVoltageLevelDiagram(vlId) {
        // TODO code factorization for displaying a VL via a hook
        if (vlId) {
            props.onChangeTab(0); // switch to map view
            openDiagramView(vlId, DiagramType.VOLTAGE_LEVEL);
        }
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
                <MapViewer
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    view={props.view}
                    openDiagramView={openDiagramView}
                    tableEquipment={tableEquipment}
                    onTableEquipementChanged={(newTableEquipment) => setTableEquipment(newTableEquipment)}
                    onChangeTab={props.onChangeTab}
                    setErrorMessage={setErrorMessage}
                ></MapViewer>
            </div>
            {/* using a key in these TabPanelLazy because we can change the nodeUuid in this component */}
            <TabPanelLazy key={`spreadsheet-${currentNode?.id}`} selected={props.view === StudyView.SPREADSHEET}>
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
            </TabPanelLazy>

            <Box
                sx={{
                    height: '100%',
                    flexDirection: 'column',
                    display: props.view === StudyView.RESULTS ? 'flex' : 'none',
                }}
            >
                <TabPanelLazy key={`results-${currentNode?.id}`} selected={props.view === StudyView.RESULTS}>
                    <ResultViewTab
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        openVoltageLevelDiagram={openVoltageLevelDiagram}
                        disabled={disabled}
                        view={props.view}
                    />
                </TabPanelLazy>
            </Box>
            <TabPanelLazy selected={props.view === StudyView.LOGS} key={`logs-${currentNode?.id}`}>
                <ReportViewerTab
                    visible={props.view === StudyView.LOGS}
                    currentNode={currentNode}
                    disabled={disabled}
                />
            </TabPanelLazy>
            <TabPanelLazy key={`parameters-${currentNode?.id}`} selected={props.view === StudyView.PARAMETERS}>
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
