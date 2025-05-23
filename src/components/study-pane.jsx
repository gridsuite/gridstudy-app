/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { ReportViewerTab } from './report-viewer-tab';
import { ResultViewTab } from './result-view-tab';
import TabPanelLazy from './results/common/tab-panel-lazy';
import { isNodeBuilt } from './graph/util/model-functions';
import { SpreadsheetView } from './spreadsheet-view/spreadsheet-view';
import ParametersTabs from './parameters-tabs';
import MapViewer from './map-viewer';
import { StudyView } from './utils/utils';
import { DiagramType } from './diagrams/diagram.type';
import { useDiagram } from './diagrams/use-diagram';
import HorizontalToolbar from './horizontal-toolbar';

const styles = {
    tabsContainer: {
        flexGrow: 1,
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
    paneContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
};

const StudyPane = ({ studyUuid, currentNode, currentRootNetworkUuid, ...props }) => {
    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
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

    const unsetTableEquipment = useCallback(() => {
        setTableEquipment({ id: null, type: null });
    }, []);

    return (
        <Box sx={styles.paneContainer}>
            <HorizontalToolbar />
            <Box sx={styles.tabsContainer}>
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
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        view={props.view}
                        openDiagramView={openDiagramView}
                        tableEquipment={tableEquipment}
                        onTableEquipementChanged={(newTableEquipment) => setTableEquipment(newTableEquipment)}
                        onChangeTab={props.onChangeTab}
                    ></MapViewer>
                </div>
                {/* using a key in these TabPanelLazy because we can change the nodeUuid in this component */}
                <TabPanelLazy key={`spreadsheet-${currentNode?.id}`} selected={props.view === StudyView.SPREADSHEET}>
                    <SpreadsheetView
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        equipmentId={tableEquipment.id}
                        equipmentType={tableEquipment.type}
                        disabled={disabled}
                        onEquipmentScrolled={unsetTableEquipment}
                    />
                </TabPanelLazy>
                <TabPanelLazy key={`results-${currentNode?.id}`} selected={props.view === StudyView.RESULTS}>
                    <ResultViewTab
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        openVoltageLevelDiagram={openVoltageLevelDiagram}
                        disabled={disabled}
                        view={props.view}
                    />
                </TabPanelLazy>
                <TabPanelLazy selected={props.view === StudyView.LOGS} key={`logs-${currentNode?.id}`}>
                    <ReportViewerTab
                        visible={props.view === StudyView.LOGS}
                        currentNode={currentNode}
                        disabled={disabled}
                    />
                </TabPanelLazy>
                <TabPanelLazy key={`parameters-${currentNode?.id}`} selected={props.view === StudyView.PARAMETERS}>
                    <ParametersTabs view={props.view} />
                </TabPanelLazy>
            </Box>
        </Box>
    );
};

StudyPane.defaultProps = {
    view: StudyView.MAP,
};

StudyPane.propTypes = {
    view: PropTypes.oneOf(Object.values(StudyView)).isRequired,
    onChangeTab: PropTypes.func,
};

export default StudyPane;
