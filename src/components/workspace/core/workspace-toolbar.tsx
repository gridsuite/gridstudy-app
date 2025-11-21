/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useEffect } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
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
    OfflineBolt,
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
import { WindowType } from '../types/workspace.types';
import { toggleWindow, closeWindow } from '../../../redux/slices/workspace-slice';
import { selectIsWindowTypeOpen, selectWindows } from '../../../redux/slices/workspace-selectors';
import { openSLD, openNAD } from '../window-contents/diagrams/common/use-diagram-handlers';
import { DiagramType } from '../../grid-layout/cards/diagrams/diagram.type';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
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

    const isTreeOpen = useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.TREE));
    const isSpreadsheetOpen = useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.SPREADSHEET));
    const isLogsOpen = useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.LOGS));
    const isResultsOpen = useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.RESULTS));
    const isParametersOpen = useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.PARAMETERS));
    const isNodeEditorOpen = useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.NODE_EDITOR));
    const isEventScenarioOpen = useSelector((state: RootState) =>
        selectIsWindowTypeOpen(state, WindowType.EVENT_SCENARIO)
    );
    const isMapOpen = useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.MAP));
    const allWindows = useSelector(selectWindows);

    // Close EVENT_SCENARIO window when developer mode is disabled
    useEffect(() => {
        if (!enableDeveloperMode) {
            const eventScenarioWindows = allWindows.filter((window) => window.type === WindowType.EVENT_SCENARIO);
            eventScenarioWindows.forEach((window) => {
                dispatch(closeWindow(window.id));
            });
        }
    }, [enableDeveloperMode, allWindows, dispatch]);

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0 && selectedElements[0].type) {
            dispatch(openNAD(selectedElements[0].name, { nadConfigUuid: selectedElements[0].id }));
        }
        setIsLoadSelectorOpen(false);
    };

    const handleSearchEquipment = (equipment: EquipmentInfos) => {
        if (equipment.type === EquipmentType.VOLTAGE_LEVEL || equipment.voltageLevelId) {
            const vlId = equipment.voltageLevelId || equipment.id;
            dispatch(openSLD(vlId, DiagramType.VOLTAGE_LEVEL));
        } else if (equipment.type === EquipmentType.SUBSTATION) {
            dispatch(openSLD(equipment.id, DiagramType.SUBSTATION));
        }
    };

    return (
        <Box sx={styles.container}>
            <ToggleButtonGroup size="small">
                <Tooltip title={<FormattedMessage id="Tree" />}>
                    <ToggleButton
                        value="tree"
                        selected={isTreeOpen}
                        onClick={() => dispatch(toggleWindow(WindowType.TREE))}
                        sx={styles.toggleButton}
                    >
                        <AccountTree fontSize="small" sx={{ transform: 'scaleY(-1) rotate(-90deg)' }} />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="modifications" />}>
                    <ToggleButton
                        value="node-editor"
                        selected={isNodeEditorOpen}
                        onClick={() => dispatch(toggleWindow(WindowType.NODE_EDITOR))}
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
                            onClick={() => dispatch(toggleWindow(WindowType.EVENT_SCENARIO))}
                            sx={styles.toggleButton}
                        >
                            <OfflineBolt fontSize="small" />
                        </ToggleButton>
                    </Tooltip>
                )}
                <Tooltip title={<FormattedMessage id="Spreadsheet" />}>
                    <ToggleButton
                        value="spreadsheet"
                        selected={isSpreadsheetOpen}
                        onClick={() => dispatch(toggleWindow(WindowType.SPREADSHEET))}
                        sx={styles.toggleButton}
                    >
                        <TableChart fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Results" />}>
                    <ToggleButton
                        value="results"
                        selected={isResultsOpen}
                        onClick={() => dispatch(toggleWindow(WindowType.RESULTS))}
                        sx={styles.toggleButton}
                    >
                        <Assessment fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Logs" />}>
                    <ToggleButton
                        value="logs"
                        selected={isLogsOpen}
                        onClick={() => dispatch(toggleWindow(WindowType.LOGS))}
                        sx={styles.toggleButton}
                    >
                        <TextSnippet fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="parameters" />}>
                    <ToggleButton
                        value="parameters"
                        selected={isParametersOpen}
                        onClick={() => dispatch(toggleWindow(WindowType.PARAMETERS))}
                        sx={styles.toggleButton}
                    >
                        <Settings fontSize="small" />
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>
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
                        onClick={() => dispatch(toggleWindow(WindowType.MAP))}
                        sx={styles.toggleButton}
                    >
                        <Public fontSize="small" />
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>
            <DirectoryItemSelector
                open={isLoadSelectorOpen}
                onClose={selectElement}
                types={[ElementType.DIAGRAM_CONFIG]}
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
                    disablCenterSubstation={true}
                />
            }
        </Box>
    );
};
