/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import {
    ArrowsOutputIcon,
    DirectoryItemSelector,
    ElementSaveDialog,
    ElementType,
    type EquipmentInfos,
    EquipmentType,
    type IElementCreationDialog,
    type IElementUpdateDialog,
    type MuiStyles,
    type TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import UploadIcon from '@mui/icons-material/Upload';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { FormControlLabel, Switch, type Theme, Tooltip } from '@mui/material';
import { AppState } from 'redux/reducer.type';
import { FormattedMessage, useIntl } from 'react-intl';
import type { UUID } from 'node:crypto';
import { AddLocationOutlined } from '@mui/icons-material';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { fetchNetworkElementInfos } from 'services/study/network';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import VoltageLevelSearchMenu from './voltage-level-search-menu';
import UndoRedoButtons from './undo-redo-buttons';
import FilterChip from './filter-chip';
import { type NadEdit, NadEditType, type NadHistory } from 'components/workspace/diagrams/nad/nad-edit-history';

const getControlsBackgroundColor = (theme: Theme) =>
    theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.background.default;

const styles = {
    actionIcon: (theme) => ({
        width: theme.spacing(3),
        height: theme.spacing(3),
    }),
    panel: (theme) => ({
        backgroundColor: getControlsBackgroundColor(theme),
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.5),
        display: 'block',
        position: 'absolute',
        top: theme.spacing(1),
        left: theme.spacing(1),
    }),
    icon: {
        fontSize: 'medium',
    },

    editModeSwitch: (theme) => ({
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        height: theme.spacing(4),
        margin: 0,
        paddingLeft: theme.spacing(1),
        borderRadius: theme.spacing(1),
        backgroundColor: getControlsBackgroundColor(theme),
        '& .MuiFormControlLabel-label': {
            fontSize: theme.typography.body2.fontSize,
        },
    }),
    divider: {
        margin: '2px 4px',
    },
} as const satisfies MuiStyles;

interface DiagramControlsProps {
    onSave?: (data: IElementCreationDialog) => void;
    onUpdate?: (data: IElementUpdateDialog) => void;
    onLoad?: (elementUuid: UUID, elementType: ElementType, elementName: string) => void;
    isEditNadMode: boolean;
    onToggleEditNadMode?: (isEditMode: boolean) => void;
    onEdit: (edit: NadEdit) => void;
    isDiagramLoading?: boolean;
    filterUuid?: UUID;
    filterName?: string;
    isFilterDeleted: boolean;
    hasHiddenVoltageLevels: boolean;
    svgVoltageLevels?: string[];
    onFocusVoltageLevel?: (vlId: string) => void;
    editHistory: NadHistory;
    onRestoreHistoryState: (target: number) => void;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({
    onSave,
    onUpdate,
    onLoad,
    isEditNadMode,
    onToggleEditNadMode,
    onEdit,
    isDiagramLoading,
    filterUuid,
    filterName = '',
    isFilterDeleted,
    hasHiddenVoltageLevels,
    svgVoltageLevels,
    onFocusVoltageLevel,
    editHistory,
    onRestoreHistoryState,
}) => {
    const intl = useIntl();
    // A deleted filter keeps the filter mode actions until the user removes or changes it
    const isFilterMode = !!filterUuid;
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const [filterSelectorEdit, setFilterSelectorEdit] = useState<
        NadEditType.ADD_FROM_FILTER | NadEditType.APPLY_FILTER
    >();
    // The selector only takes a new array as its selection, so one is made each time it opens
    const filterSelection = useMemo(
        () =>
            filterSelectorEdit === NadEditType.APPLY_FILTER && filterUuid && !isFilterDeleted
                ? [filterUuid]
                : undefined,
        [filterSelectorEdit, filterUuid, isFilterDeleted]
    );
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id ?? null);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const handleCloseSaveDialog = () => {
        setIsSaveDialogOpen(false);
    };

    const handleClickSaveIcon = () => {
        setIsSaveDialogOpen(true);
    };

    const handleCloseLoadSelector = () => {
        setIsLoadSelectorOpen(false);
    };

    const handleClickLoadIcon = () => {
        setIsLoadSelectorOpen(true);
    };

    // In filter mode, expanding only shows hidden voltage levels again, which needs the filter
    const canExpandAll = isFilterMode ? hasHiddenVoltageLevels && !isFilterDeleted : !!svgVoltageLevels?.length;

    const handleClickExpandAllVoltageLevelsIcon = () => {
        onEdit({ type: NadEditType.EXPAND_ALL });
    };
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);
    const [searchAnchorEl, setSearchAnchorEl] = useState<HTMLElement | null>(null);

    const handleClickAddVoltageLevelIcon = () => {
        setIsDialogSearchOpen(true);
    };

    const handleClickSearchVoltageLevelIcon = (event: React.MouseEvent<HTMLElement>) => {
        setSearchAnchorEl(event.currentTarget);
    };

    const handleCloseSearch = () => {
        setSearchAnchorEl(null);
    };
    const handleSave = (data: IElementCreationDialog) => {
        if (onSave) {
            onSave(data);
        }
    };

    const handleUpdate = (data: IElementUpdateDialog) => {
        if (onUpdate) {
            onUpdate(data);
        }
    };

    const handleLoad = (elementUuid: UUID, elementType: ElementType, elementName: string) => {
        if (onLoad) {
            onLoad(elementUuid, elementType, elementName);
        }
    };

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0) {
            handleLoad(selectedElements[0].id, selectedElements[0].type!, selectedElements[0].name);
        }
        handleCloseLoadSelector();
    };

    const handleSelectFilter = (selectedElements: TreeViewFinderNodeProps[]) => {
        const [selectedFilter] = selectedElements;
        if (selectedFilter && filterSelectorEdit) {
            onEdit({ type: filterSelectorEdit, filterUuid: selectedFilter.id, filterName: selectedFilter.name });
        }
        setFilterSelectorEdit(undefined);
    };

    const handleToggleEditMode = () => {
        onToggleEditNadMode?.(!isEditNadMode);
    };

    const handleVoltageLevelSelect = useCallback(
        (voltageLevelId: string) => {
            if (onFocusVoltageLevel) {
                onFocusVoltageLevel(voltageLevelId);
            }
            handleCloseSearch();
        },
        [onFocusVoltageLevel]
    );

    const handleCloseSearchDialog = useCallback(() => {
        setIsDialogSearchOpen(false);
    }, []);

    const { snackWarning } = useSnackMessage();

    const onSelectionChange = useCallback(
        (equipment: EquipmentInfos) => {
            handleCloseSearchDialog();
            if (!currentNodeUuid || !currentRootNetworkUuid) {
                return;
            }
            fetchNetworkElementInfos(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                equipment.type,
                EQUIPMENT_INFOS_TYPES.LIST.type,
                equipment.id,
                false
            )
                .then(() => {
                    onEdit({ type: NadEditType.ADD_VOLTAGE_LEVEL, voltageLevelId: equipment.id });
                })
                .catch(() => {
                    snackWarning({
                        messageId: 'NetworkEquipmentNotFound',
                        messageValues: { equipmentId: equipment.id },
                    });
                });
        },
        [handleCloseSearchDialog, currentNodeUuid, currentRootNetworkUuid, studyUuid, onEdit, snackWarning]
    );
    function renderSearchEquipment() {
        if (!currentRootNetworkUuid || !currentNodeUuid) {
            return;
        }
        return (
            <EquipmentSearchDialog
                open={isDialogSearchOpen}
                onClose={handleCloseSearchDialog}
                equipmentType={EquipmentType.VOLTAGE_LEVEL}
                onSelectionChange={onSelectionChange}
                currentNodeUuid={currentNodeUuid}
                currentRootNetworkUuid={currentRootNetworkUuid}
            />
        );
    }

    /**
     * RENDER
     */

    return (
        <>
            <Box sx={styles.panel}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {isEditNadMode && (
                        <>
                            <UndoRedoButtons
                                history={editHistory}
                                onRestoreHistoryState={onRestoreHistoryState}
                                disabled={isDiagramLoading}
                            />
                            <Divider orientation="vertical" flexItem sx={styles.divider} />
                        </>
                    )}
                    <Tooltip title={<FormattedMessage id={'SaveToGridexplore'} />}>
                        <IconButton sx={styles.actionIcon} onClick={handleClickSaveIcon}>
                            <SaveIcon sx={styles.icon} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={<FormattedMessage id={'importAndReplaceFromGridExplore'} />}>
                        <IconButton sx={styles.actionIcon} onClick={handleClickLoadIcon}>
                            <UploadIcon sx={styles.icon} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={<FormattedMessage id={'searchVoltageLevelInNad'} />}>
                        <span>
                            <IconButton
                                sx={styles.actionIcon}
                                onClick={handleClickSearchVoltageLevelIcon}
                                disabled={isDiagramLoading || !svgVoltageLevels || svgVoltageLevels.length === 0}
                            >
                                <SearchIcon sx={styles.icon} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    {isFilterMode && (
                        <>
                            <Divider orientation="vertical" flexItem sx={styles.divider} />
                            <FilterChip
                                filterName={filterName}
                                isFilterDeleted={isFilterDeleted}
                                isEditMode={isEditNadMode}
                                disabled={isDiagramLoading}
                                onChange={() => setFilterSelectorEdit(NadEditType.APPLY_FILTER)}
                                onRemove={() => onEdit({ type: NadEditType.REMOVE_FILTER, filterName })}
                            />
                        </>
                    )}
                    {isEditNadMode && (
                        <>
                            <Divider orientation="vertical" flexItem sx={styles.divider} />
                            {!isFilterMode && (
                                <>
                                    <Tooltip title={<FormattedMessage id={'nadReplaceWithFilter'} />}>
                                        <span>
                                            <IconButton
                                                sx={styles.actionIcon}
                                                onClick={() => setFilterSelectorEdit(NadEditType.APPLY_FILTER)}
                                                disabled={isDiagramLoading}
                                            >
                                                <FilterAltIcon sx={styles.icon} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title={<FormattedMessage id={'addVoltageLevelsFromFilter'} />}>
                                        <span>
                                            <IconButton
                                                sx={styles.actionIcon}
                                                onClick={() => setFilterSelectorEdit(NadEditType.ADD_FROM_FILTER)}
                                                disabled={isDiagramLoading}
                                            >
                                                <AddLocationAltOutlinedIcon sx={styles.icon} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </>
                            )}
                            <Tooltip title={<FormattedMessage id={'expandAllVoltageLevels'} />}>
                                <span>
                                    <IconButton
                                        sx={styles.actionIcon}
                                        onClick={handleClickExpandAllVoltageLevelsIcon}
                                        disabled={isDiagramLoading || !canExpandAll}
                                    >
                                        <ArrowsOutputIcon sx={styles.icon} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            {!isFilterMode && (
                                <Tooltip title={<FormattedMessage id={'addVoltageLevel'} />}>
                                    <span>
                                        <IconButton
                                            sx={styles.actionIcon}
                                            onClick={handleClickAddVoltageLevelIcon}
                                            disabled={isDiagramLoading}
                                        >
                                            <AddLocationOutlined sx={styles.icon} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </>
                    )}
                </Box>
            </Box>
            <FormControlLabel
                sx={styles.editModeSwitch}
                labelPlacement="start"
                label={<FormattedMessage id="EditNad" />}
                control={<Switch size="small" checked={isEditNadMode} onChange={handleToggleEditMode} />}
            />
            {studyUuid && (
                <>
                    {isSaveDialogOpen && (
                        <ElementSaveDialog
                            studyUuid={studyUuid}
                            onClose={handleCloseSaveDialog}
                            onSave={handleSave}
                            OnUpdate={handleUpdate}
                            open={isSaveDialogOpen}
                            type={ElementType.DIAGRAM_CONFIG}
                            selectorTitleId={'NetworkAreaDiagram'}
                            createLabelId={'diagramConfigSave'}
                            updateLabelId={'diagramConfigUpdate'}
                            titleId={'SaveToGridexplore'}
                        />
                    )}
                    <Box
                        sx={{
                            minWidth: '12em',
                        }}
                    >
                        <DirectoryItemSelector
                            open={isLoadSelectorOpen}
                            onClose={selectElement}
                            types={[ElementType.DIAGRAM_CONFIG, ElementType.FILTER]}
                            equipmentTypes={[EquipmentType.VOLTAGE_LEVEL]}
                            title={intl.formatMessage({
                                id: 'elementSelection',
                            })}
                            multiSelect={false}
                        />
                    </Box>
                    <Box
                        sx={{
                            minWidth: '12em',
                        }}
                    >
                        <DirectoryItemSelector
                            open={!!filterSelectorEdit}
                            onClose={handleSelectFilter}
                            types={[ElementType.FILTER]}
                            equipmentTypes={[EquipmentType.VOLTAGE_LEVEL]}
                            title={intl.formatMessage({
                                id: 'elementSelection',
                            })}
                            multiSelect={false}
                            selected={filterSelection}
                        />
                    </Box>
                    {renderSearchEquipment()}
                    {svgVoltageLevels && (
                        <VoltageLevelSearchMenu
                            open={Boolean(searchAnchorEl)}
                            anchorEl={searchAnchorEl}
                            onClose={handleCloseSearch}
                            voltageLevels={svgVoltageLevels}
                            onSelect={handleVoltageLevelSelect}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default DiagramControls;
