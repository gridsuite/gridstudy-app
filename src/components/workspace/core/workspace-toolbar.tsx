/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Search,
    Public,
    Upload,
    AccountTree,
    TableView,
    Description,
    Assessment,
    Settings,
    Edit,
} from '@mui/icons-material';
import {
    DirectoryItemSelector,
    ElementType,
    type EquipmentInfos,
    type MuiStyles,
    type TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { TopBarEquipmentSearchDialog } from '../../top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import { WindowType } from '../types/workspace.types';
import { toggleWindow } from '../../../redux/slices/workspace-slice';
import { selectIsWindowTypeOpen } from '../../../redux/slices/workspace-selectors';
import {
    useDiagramHandlers,
    openNadConfigHelper,
    openEquipmentDiagramHelper,
} from '../window-contents/diagrams/common/use-diagram-handlers';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
    },
} as const satisfies MuiStyles;

export const WorkspaceToolbar = () => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const { openDiagram } = useDiagramHandlers();

    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0 && selectedElements[0].type) {
            openNadConfigHelper(openDiagram, selectedElements[0].id);
        }
        setIsLoadSelectorOpen(false);
    };

    const handleSearchEquipment = (equipment: EquipmentInfos) => openEquipmentDiagramHelper(openDiagram, equipment);

    return (
        <Box sx={styles.container}>
            <ToggleButtonGroup size="small">
                <Tooltip title={<FormattedMessage id="Tree" />}>
                    <ToggleButton
                        value="tree"
                        selected={useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.TREE))}
                        onClick={() => dispatch(toggleWindow(WindowType.TREE))}
                    >
                        <AccountTree fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Spreadsheet" />}>
                    <ToggleButton
                        value="spreadsheet"
                        selected={useSelector((state: RootState) =>
                            selectIsWindowTypeOpen(state, WindowType.SPREADSHEET)
                        )}
                        onClick={() => dispatch(toggleWindow(WindowType.SPREADSHEET))}
                    >
                        <TableView fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Logs" />}>
                    <ToggleButton
                        value="logs"
                        selected={useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.LOGS))}
                        onClick={() => dispatch(toggleWindow(WindowType.LOGS))}
                    >
                        <Description fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="Results" />}>
                    <ToggleButton
                        value="results"
                        selected={useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.RESULTS))}
                        onClick={() => dispatch(toggleWindow(WindowType.RESULTS))}
                    >
                        <Assessment fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="parameters" />}>
                    <ToggleButton
                        value="parameters"
                        selected={useSelector((state: RootState) =>
                            selectIsWindowTypeOpen(state, WindowType.PARAMETERS)
                        )}
                        onClick={() => dispatch(toggleWindow(WindowType.PARAMETERS))}
                    >
                        <Settings fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="NodeEditor" />}>
                    <ToggleButton
                        value="node-editor"
                        selected={useSelector((state: RootState) =>
                            selectIsWindowTypeOpen(state, WindowType.NODE_EDITOR)
                        )}
                        onClick={() => dispatch(toggleWindow(WindowType.NODE_EDITOR))}
                    >
                        <Edit fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="equipment_search/label" />}>
                    <ToggleButton value="search" onClick={() => setIsDialogSearchOpen(true)}>
                        <Search fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="importFromGridExplore" />}>
                    <ToggleButton value="upload" onClick={() => setIsLoadSelectorOpen(true)}>
                        <Upload fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="OpenMapCard" />}>
                    <ToggleButton
                        value="map"
                        selected={useSelector((state: RootState) => selectIsWindowTypeOpen(state, WindowType.MAP))}
                        onClick={() => dispatch(toggleWindow(WindowType.MAP))}
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
