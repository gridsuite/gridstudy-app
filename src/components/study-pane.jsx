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
import TreeTab from './tree-tab';
import { StudyView } from './utils/utils';
import { DiagramType } from './grid-layout/cards/diagrams/diagram.type';
import HorizontalToolbar from './horizontal-toolbar';
import { openDiagram, setToggleOptions } from '../redux/actions.js';
import { useDispatch, useSelector } from 'react-redux';
import { StudyDisplayMode } from './network-modification.type';

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
    const toggleOptions = useSelector((state) => state.toggleOptions);
    const dispatch = useDispatch();
    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
    });

    const disabled = !isNodeBuilt(currentNode);
    const showGrid = useCallback(() => {
        // switch to tree view
        onChangeTab(0);
        // toggle diagram grid layout
        if (!toggleOptions.includes(StudyDisplayMode.GRID_LAYOUT_PANEL)) {
            dispatch(setToggleOptions([...toggleOptions, StudyDisplayMode.GRID_LAYOUT_PANEL]));
        }
    }, [dispatch, onChangeTab, toggleOptions]);

    const openVoltageLevelDiagram = useCallback(
        (equipmentId, diagramType = DiagramType.VOLTAGE_LEVEL) => {
            // TODO code factorization for displaying a VL via a hook
            if (equipmentId) {
                showGrid();
                dispatch(openDiagram(equipmentId, diagramType));
            }
        },
        [dispatch, showGrid]
    );

    const unsetTableEquipment = useCallback(() => {
        setTableEquipment({ id: null, type: null });
    }, []);

    const handleTableEquipmentChanged = useCallback((newTableEquipment) => setTableEquipment(newTableEquipment), []);

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
                    <TreeTab
                        studyUuid={studyUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        tableEquipment={tableEquipment}
                        onTableEquipementChanged={handleTableEquipmentChanged}
                        onChangeTab={onChangeTab}
                        showGrid={showGrid}
                    />
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
