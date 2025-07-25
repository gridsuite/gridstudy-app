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
import HorizontalToolbar from './horizontal-toolbar';
import { openDiagram } from '../redux/actions.js';
import { useDispatch } from 'react-redux';

const styles = {
    tabsContainer: (theme) => {
        return {
            flexGrow: 1,
            height: '100%',
            background: theme.palette.tabBackground,
        };
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
    paneContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
};

const StudyPane = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    view = StudyView.TREE,
    onChangeTab,
    ...props
}) => {
    const dispatch = useDispatch();
    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
    });

    const disabled = !isNodeBuilt(currentNode);
    const openVoltageLevelDiagram = useCallback(
        (equipmentId, diagramType = DiagramType.VOLTAGE_LEVEL) => {
            // TODO code factorization for displaying a VL via a hook
            if (equipmentId) {
                onChangeTab(0); // switch to map view
                dispatch(openDiagram(equipmentId, diagramType));
            }
        },
        [dispatch, onChangeTab]
    );

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
                        display: view === StudyView.TREE ? null : 'none',
                    }}
                >
                    <MapViewer
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        view={view}
                        tableEquipment={tableEquipment}
                        onTableEquipementChanged={(newTableEquipment) => setTableEquipment(newTableEquipment)}
                        onChangeTab={onChangeTab}
                    ></MapViewer>
                </div>
                {/* using a key in these TabPanelLazy because we can change the nodeUuid in this component */}
                <TabPanelLazy key={`spreadsheet-${currentNode?.id}`} selected={view === StudyView.SPREADSHEET}>
                    <SpreadsheetView
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        equipmentId={tableEquipment.id}
                        equipmentType={tableEquipment.type}
                        disabled={disabled}
                        onEquipmentScrolled={unsetTableEquipment}
                        openDiagram={openVoltageLevelDiagram}
                    />
                </TabPanelLazy>
                <TabPanelLazy key={`results-${currentNode?.id}`} selected={view === StudyView.RESULTS}>
                    <ResultViewTab
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        openVoltageLevelDiagram={openVoltageLevelDiagram}
                        disabled={disabled}
                        view={view}
                    />
                </TabPanelLazy>
                <TabPanelLazy selected={view === StudyView.LOGS} key={`logs-${currentNode?.id}`}>
                    <ReportViewerTab visible={view === StudyView.LOGS} currentNode={currentNode} disabled={disabled} />
                </TabPanelLazy>
                <TabPanelLazy key={`parameters-${currentNode?.id}`} selected={view === StudyView.PARAMETERS}>
                    <ParametersTabs view={view} />
                </TabPanelLazy>
            </Box>
        </Box>
    );
};

StudyPane.propTypes = {
    view: PropTypes.oneOf(Object.values(StudyView)).isRequired,
    onChangeTab: PropTypes.func,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
};

export default StudyPane;
