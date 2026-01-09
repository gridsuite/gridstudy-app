/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect, useMemo } from 'react';
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
    PARAM_DEVELOPER_MODE,
} from '@gridsuite/commons-ui';
import { TopBarEquipmentSearchDialog } from '../../top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { useParameterState } from '../../dialogs/parameters/use-parameters-state';
import { useSelector } from 'react-redux';
import { PanelType } from '../types/workspace.types';
import { useWorkspaceActions } from '../hooks/use-workspace-actions';
import { selectOpenPanels } from '../../../redux/slices/workspace-selectors';

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
    const { toggleToolPanel, openSLD, openNAD, deletePanel } = useWorkspaceActions();

    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);
    const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const allPanels = useSelector(selectOpenPanels);

    const panelStates = useMemo(() => {
        const openTypes = new Set(allPanels.filter((p) => !p.minimized).map((p) => p.type));
        return {
            isTreeOpen: openTypes.has(PanelType.TREE),
            isSpreadsheetOpen: openTypes.has(PanelType.SPREADSHEET),
            isLogsOpen: openTypes.has(PanelType.LOGS),
            isResultsOpen: openTypes.has(PanelType.RESULTS),
            isParametersOpen: openTypes.has(PanelType.PARAMETERS),
            isNodeEditorOpen: openTypes.has(PanelType.MODIFICATIONS),
            isEventScenarioOpen: openTypes.has(PanelType.EVENT_SCENARIO),
            isMapOpen: openTypes.has(PanelType.MAP),
        };
    }, [allPanels]);

    const {
        isTreeOpen,
        isSpreadsheetOpen,
        isLogsOpen,
        isResultsOpen,
        isParametersOpen,
        isNodeEditorOpen,
        isEventScenarioOpen,
        isMapOpen,
    } = panelStates;

    // Close EVENT_SCENARIO panel when developer mode is disabled
    useEffect(() => {
        if (!isDeveloperMode) {
            const eventScenarioPanels = allPanels.filter((panel) => panel.type === PanelType.EVENT_SCENARIO);
            eventScenarioPanels.forEach((panel) => {
                deletePanel(panel.id);
            });
        }
    }, [isDeveloperMode, allPanels, deletePanel]);

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0 && selectedElements[0].type) {
            const element = selectedElements[0];
            if (element.type === ElementType.DIAGRAM_CONFIG) {
                openNAD({ title: element.name, nadConfigUuid: element.id });
            } else if (element.type === ElementType.FILTER) {
                openNAD({ title: element.name, filterUuid: element.id });
            }
        }
        setIsLoadSelectorOpen(false);
    };

    const handleSearchEquipment = (equipment: EquipmentInfos) => {
        if (equipment.type === EquipmentType.VOLTAGE_LEVEL || equipment.voltageLevelId) {
            const vlId = equipment.voltageLevelId || equipment.id;
            openSLD({ diagramId: vlId, panelType: PanelType.SLD_VOLTAGE_LEVEL });
        } else if (equipment.type === EquipmentType.SUBSTATION) {
            openSLD({ diagramId: equipment.id, panelType: PanelType.SLD_SUBSTATION });
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
                        onClick={() => toggleToolPanel(PanelType.TREE)}
                        sx={styles.toggleButton}
                    >
                        <AccountTree fontSize="small" sx={{ transform: 'scaleY(-1) rotate(-90deg)' }} />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="modifications" />}>
                    <ToggleButton
                        value="node-editor"
                        selected={isNodeEditorOpen}
                        onClick={() => toggleToolPanel(PanelType.MODIFICATIONS)}
                        sx={styles.toggleButton}
                    >
                        <Tune fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                {isDeveloperMode && (
                    <Tooltip title={<FormattedMessage id="DynamicSimulation" />}>
                        <ToggleButton
                            value="event-scenario"
                            selected={isEventScenarioOpen}
                            onClick={() => toggleToolPanel(PanelType.EVENT_SCENARIO)}
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
                        onClick={() => toggleToolPanel(PanelType.SPREADSHEET)}
                        sx={styles.toggleButton}
                    >
                        <TableChart fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Results" />}>
                    <ToggleButton
                        value="results"
                        selected={isResultsOpen}
                        onClick={() => toggleToolPanel(PanelType.RESULTS)}
                        sx={styles.toggleButton}
                    >
                        <Assessment fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Logs" />}>
                    <ToggleButton
                        value="logs"
                        selected={isLogsOpen}
                        onClick={() => toggleToolPanel(PanelType.LOGS)}
                        sx={styles.toggleButton}
                    >
                        <TextSnippet fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="parameters" />}>
                    <ToggleButton
                        value="parameters"
                        selected={isParametersOpen}
                        onClick={() => toggleToolPanel(PanelType.PARAMETERS)}
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
                        onClick={() => toggleToolPanel(PanelType.MAP)}
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
