/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Search,
    Public,
    Upload,
    TableChart,
    Assessment,
    Settings,
    Tune,
    AccountTree,
    OfflineBoltOutlined,
    TextSnippet,
} from '@mui/icons-material';
import {
    DirectoryItemSelector,
    ElementType,
    EquipmentType,
    type EquipmentInfos,
    type MuiStyles,
    type TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { TopBarEquipmentSearchDialog } from '../../top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { useParameterState } from '../../dialogs/parameters/use-parameters-state';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import { PanelType } from '../types/workspace.types';
import { togglePanel, closePanel, openSLD, openNAD } from '../../../redux/slices/workspace-slice';
import { selectIsPanelTypeOpen, selectOpenPanels } from '../../../redux/slices/workspace-selectors';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        marginLeft: 2,
    },
    toggleButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
    },
    actionButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        '&.Mui-selected': {
            backgroundColor: 'transparent',
            '&:hover': {
                backgroundColor: 'action.hover',
            },
        },
    },
} as const satisfies MuiStyles;

export const WorkspaceToolbar = () => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isTreeOpen = useSelector((state: RootState) => selectIsPanelTypeOpen(state, PanelType.TREE));
    const isSpreadsheetOpen = useSelector((state: RootState) => selectIsPanelTypeOpen(state, PanelType.SPREADSHEET));
    const isLogsOpen = useSelector((state: RootState) => selectIsPanelTypeOpen(state, PanelType.LOGS));
    const isResultsOpen = useSelector((state: RootState) => selectIsPanelTypeOpen(state, PanelType.RESULTS));
    const isParametersOpen = useSelector((state: RootState) => selectIsPanelTypeOpen(state, PanelType.PARAMETERS));
    const isNodeEditorOpen = useSelector((state: RootState) => selectIsPanelTypeOpen(state, PanelType.NODE_EDITOR));
    const isEventScenarioOpen = useSelector((state: RootState) =>
        selectIsPanelTypeOpen(state, PanelType.EVENT_SCENARIO)
    );
    const isMapOpen = useSelector((state: RootState) => selectIsPanelTypeOpen(state, PanelType.MAP));
    const allPanels = useSelector(selectOpenPanels);

    // Close EVENT_SCENARIO panel when developer mode is disabled
    useEffect(() => {
        if (!enableDeveloperMode) {
            const eventScenarioPanels = allPanels.filter((panel) => panel.type === PanelType.EVENT_SCENARIO);
            eventScenarioPanels.forEach((panel) => {
                dispatch(closePanel(panel.id));
            });
        }
    }, [enableDeveloperMode, allPanels, dispatch]);

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0 && selectedElements[0].type) {
            const element = selectedElements[0];
            if (element.type === ElementType.DIAGRAM_CONFIG) {
                dispatch(openNAD({ name: element.name, nadConfigUuid: element.id }));
            } else if (element.type === ElementType.FILTER) {
                dispatch(openNAD({ name: element.name, filterUuid: element.id }));
            }
        }
        setIsLoadSelectorOpen(false);
    };

    const handleSearchEquipment = (equipment: EquipmentInfos) => {
        if (equipment.type === EquipmentType.VOLTAGE_LEVEL || equipment.voltageLevelId) {
            const vlId = equipment.voltageLevelId || equipment.id;
            dispatch(openSLD({ id: vlId, panelType: PanelType.SLD_VOLTAGE_LEVEL }));
        } else if (equipment.type === EquipmentType.SUBSTATION) {
            dispatch(openSLD({ id: equipment.id, panelType: PanelType.SLD_SUBSTATION }));
        }
    };

    return (
        <Box sx={styles.container}>
            <Typography sx={{ marginLeft: 0.5, display: { xs: 'none', lg: 'block' } }}>
                <FormattedMessage id="panels" />
            </Typography>
            <ToggleButtonGroup size="small">
                <Tooltip title={<FormattedMessage id="Tree" />}>
                    <ToggleButton
                        value="tree"
                        selected={isTreeOpen}
                        onClick={() => dispatch(togglePanel(PanelType.TREE))}
                        sx={styles.toggleButton}
                    >
                        <AccountTree fontSize="small" sx={{ transform: 'scaleY(-1) rotate(-90deg)' }} />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="modifications" />}>
                    <ToggleButton
                        value="node-editor"
                        selected={isNodeEditorOpen}
                        onClick={() => dispatch(togglePanel(PanelType.NODE_EDITOR))}
                        sx={styles.toggleButton}
                    >
                        <Tune fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                {enableDeveloperMode && (
                    <Tooltip title={<FormattedMessage id="DynamicSimulation" />}>
                        <ToggleButton
                            value="event-scenario"
                            selected={isEventScenarioOpen}
                            onClick={() => dispatch(togglePanel(PanelType.EVENT_SCENARIO))}
                            sx={styles.toggleButton}
                        >
                            <OfflineBoltOutlined fontSize="small" />
                        </ToggleButton>
                    </Tooltip>
                )}
                <Tooltip title={<FormattedMessage id="Spreadsheet" />}>
                    <ToggleButton
                        value="spreadsheet"
                        selected={isSpreadsheetOpen}
                        onClick={() => dispatch(togglePanel(PanelType.SPREADSHEET))}
                        sx={styles.toggleButton}
                    >
                        <TableChart fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Results" />}>
                    <ToggleButton
                        value="results"
                        selected={isResultsOpen}
                        onClick={() => dispatch(togglePanel(PanelType.RESULTS))}
                        sx={styles.toggleButton}
                    >
                        <Assessment fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Logs" />}>
                    <ToggleButton
                        value="logs"
                        selected={isLogsOpen}
                        onClick={() => dispatch(togglePanel(PanelType.LOGS))}
                        sx={styles.toggleButton}
                    >
                        <TextSnippet fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="parameters" />}>
                    <ToggleButton
                        value="parameters"
                        selected={isParametersOpen}
                        onClick={() => dispatch(togglePanel(PanelType.PARAMETERS))}
                        sx={styles.toggleButton}
                    >
                        <Settings fontSize="small" />
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>
            <Typography sx={{ marginLeft: 2, display: { xs: 'none', lg: 'block' } }}>
                <FormattedMessage id="images" />
            </Typography>
            <ToggleButtonGroup size="small" sx={{ marginRight: 0.5 }}>
                <Tooltip title={<FormattedMessage id="importFromGridExplore" />}>
                    <ToggleButton
                        value="upload"
                        selected={true}
                        onClick={() => setIsLoadSelectorOpen(true)}
                        sx={styles.actionButton}
                    >
                        <Upload fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="equipment_search/label" />}>
                    <ToggleButton
                        value="search"
                        selected={true}
                        onClick={() => setIsDialogSearchOpen(true)}
                        sx={styles.actionButton}
                    >
                        <Search fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="OpenMapCard" />}>
                    <ToggleButton
                        value="map"
                        selected={isMapOpen}
                        onClick={() => dispatch(togglePanel(PanelType.MAP))}
                        sx={styles.toggleButton}
                    >
                        <Public fontSize="small" />
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>
            <DirectoryItemSelector
                open={isLoadSelectorOpen}
                onClose={selectElement}
                types={[ElementType.DIAGRAM_CONFIG, ElementType.FILTER]}
                equipmentTypes={[EQUIPMENT_TYPES.VOLTAGE_LEVEL]}
                title={intl.formatMessage({
                    id: 'elementSelection',
                })}
                multiSelect={false}
            />
            {
                <TopBarEquipmentSearchDialog
                    showVoltageLevelDiagram={handleSearchEquipment}
                    isDialogSearchOpen={isDialogSearchOpen}
                    setIsDialogSearchOpen={setIsDialogSearchOpen}
                    disablCenterSubstation={!isMapOpen}
                />
            }
        </Box>
    );
};
