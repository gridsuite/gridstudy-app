/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
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
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import SpeakerNotesOffOutlinedIcon from '@mui/icons-material/SpeakerNotesOffOutlined';
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Tooltip } from '@mui/material';
import { AppState } from 'redux/reducer';
import { FormattedMessage, useIntl } from 'react-intl';
import type { UUID } from 'node:crypto';
import { AddLocationOutlined } from '@mui/icons-material';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { fetchNetworkElementInfos } from 'services/study/network';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import VoltageLevelSearchMenu from './voltage-level-search-menu';

const styles = {
    actionIcon: (theme) => ({
        width: theme.spacing(3),
        height: theme.spacing(3),
    }),
    panel: (theme) => ({
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.background.default,
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.5),
        display: 'block',
        position: 'absolute',
        top: theme.spacing(1),
        left: theme.spacing(1),
    }),
    buttonPanel: (theme) => ({
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.5),
        display: 'block',
        position: 'absolute',
        top: '5px',
        right: '5px',
    }),
    icon: {
        fontSize: 'medium',
    },
    button: {
        minWidth: 'auto',
    },
    divider: (theme) => ({
        borderColor: theme.palette.grey[600],
        margin: '2px 4px',
    }),
} as const satisfies MuiStyles;

interface DiagramControlsProps {
    onSave?: (data: IElementCreationDialog) => void;
    onUpdate?: (data: IElementUpdateDialog) => void;
    onLoad?: (elementUuid: UUID, elementType: ElementType, elementName: string) => void;
    isEditNadMode: boolean;
    onToggleEditNadMode?: (isEditMode: boolean) => void;
    onExpandAllVoltageLevels?: () => void;
    onAddVoltageLevel: (vlId: string) => void;
    onAddVoltageLevelsFromFilter: (elementUuid: UUID) => void;
    onToggleShowLabels?: () => void;
    isShowLabels?: boolean;
    isDiagramLoading?: boolean;
    fromNadConfig: boolean;
    svgVoltageLevels?: string[];
    onFocusVoltageLevel?: (vlId: string) => void;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({
    onSave,
    onUpdate,
    onLoad,
    isEditNadMode,
    onToggleEditNadMode,
    onExpandAllVoltageLevels,
    onAddVoltageLevel,
    onAddVoltageLevelsFromFilter,
    onToggleShowLabels,
    isShowLabels,
    isDiagramLoading,
    fromNadConfig,
    svgVoltageLevels,
    onFocusVoltageLevel,
}) => {
    const intl = useIntl();
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const [isFilterSelectorOpen, setIsFilterSelectorOpen] = useState(false);
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

    const handleClickFilterIcon = () => {
        setIsFilterSelectorOpen(true);
    };

    const handleCloseFilterSelector = () => {
        setIsFilterSelectorOpen(false);
    };

    const handleToggleShowLabels = () => {
        if (onToggleShowLabels && !isDiagramLoading) {
            onToggleShowLabels();
        }
    };

    const handleClickExpandAllVoltageLevelsIcon = () => {
        if (onExpandAllVoltageLevels && !isDiagramLoading) {
            onExpandAllVoltageLevels();
        }
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
        if (onAddVoltageLevelsFromFilter && selectedElements.length > 0) {
            onAddVoltageLevelsFromFilter(selectedElements[0].id);
        }
        handleCloseFilterSelector();
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
                    onAddVoltageLevel(equipment.id);
                })
                .catch(() => {
                    snackWarning({
                        messageId: 'NetworkEquipmentNotFound',
                        messageValues: { equipmentId: equipment.id },
                    });
                });
        },
        [handleCloseSearchDialog, currentNodeUuid, currentRootNetworkUuid, studyUuid, onAddVoltageLevel, snackWarning]
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
                    <Tooltip title={<FormattedMessage id={'importAndReplaceFromGridExplore'} />}>
                        <IconButton
                            sx={styles.actionIcon}
                            onClick={handleClickFilterIcon}
                            disabled={isDiagramLoading || fromNadConfig}
                        >
                            <FilterAltIcon sx={styles.icon} />
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
                    {isEditNadMode && (
                        <>
                            <Divider orientation="vertical" flexItem sx={styles.divider} />
                            <Tooltip title={<FormattedMessage id={'expandAllVoltageLevels'} />}>
                                <span>
                                    <IconButton
                                        sx={styles.actionIcon}
                                        onClick={handleClickExpandAllVoltageLevelsIcon}
                                        disabled={isDiagramLoading}
                                    >
                                        <ArrowsOutputIcon sx={styles.icon} />
                                    </IconButton>
                                </span>
                            </Tooltip>
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
                            <Tooltip title={<FormattedMessage id={isShowLabels ? 'hideLabels' : 'showLabels'} />}>
                                <span>
                                    <IconButton
                                        sx={styles.actionIcon}
                                        onClick={handleToggleShowLabels}
                                        disabled={isDiagramLoading}
                                    >
                                        {isShowLabels ? (
                                            <SpeakerNotesOutlinedIcon sx={styles.icon} />
                                        ) : (
                                            <SpeakerNotesOffOutlinedIcon sx={styles.icon} />
                                        )}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </>
                    )}
                </Box>
            </Box>
            <Box sx={styles.buttonPanel}>
                <Button size="small" sx={styles.button} onClick={handleToggleEditMode}>
                    <FormattedMessage id={isEditNadMode ? 'apply' : 'EditNad'} />
                </Button>
            </Box>
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
                    <Box minWidth="12em">
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
                    </Box>
                    <Box minWidth="12em">
                        <DirectoryItemSelector
                            open={isFilterSelectorOpen}
                            onClose={handleSelectFilter}
                            types={[ElementType.FILTER]}
                            equipmentTypes={[EQUIPMENT_TYPES.VOLTAGE_LEVEL]}
                            title={intl.formatMessage({
                                id: 'elementSelection',
                            })}
                            multiSelect={false}
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
