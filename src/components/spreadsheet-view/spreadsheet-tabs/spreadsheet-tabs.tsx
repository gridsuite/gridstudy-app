/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Grid, Theme, Tooltip } from '@mui/material';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import AddSpreadsheetButton from '../add-spreadsheet/add-spreadsheet-button';
import { AppDispatch } from 'redux/store';
import {
    removeEquipmentData,
    removeTableDefinition,
    renameTableDefinition,
    reorderTableDefinitions,
} from 'redux/actions';
import { PopupConfirmationDialog, useSnackMessage, useStateBoolean } from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl';
import { DropResult } from '@hello-pangea/dnd';
import DroppableTabs from 'components/utils/draggable-tab/droppable-tabs';
import DraggableTab from 'components/utils/draggable-tab/draggable-tab';
import { UUID } from 'crypto';
import { ColumnDefinitionDto, SpreadsheetConfig } from '../types/spreadsheet.type';
import RenameTabDialog from './rename-tab-dialog';
import SpreadsheetTabLabel from './spreadsheet-tab-label';
import { ResetNodeAliasCallback } from '../hooks/use-node-aliases';
import RestoreIcon from '@mui/icons-material/Restore';
import {
    removeSpreadsheetConfigFromCollection,
    renameSpreadsheetModel,
    reorderSpreadsheetConfigs,
    updateSpreadsheetModel,
} from 'services/study/study-config';
import NodesConfigButton from '../spreadsheet/spreadsheet-toolbar/nodes-config/nodes-config-button';
import { NodeAlias } from '../types/node-alias.type';
import SaveIcon from '@mui/icons-material/Save';
import { SaveSpreadsheetCollectionDialog } from '../spreadsheet/spreadsheet-toolbar/save/save-spreadsheet-collection-dialog';
import { SpreadsheetModelGlobalEditorDialog } from '../spreadsheet/spreadsheet-toolbar/global-model-editor/spreadsheet-model-global-editor-dialog';
import {
    columnsModelForm,
    COLUMNS_MODEL,
} from '../spreadsheet/spreadsheet-toolbar/global-model-editor/spreadsheet-model-global-editor.utils';
import { ColumnGlobalModel } from '../spreadsheet/spreadsheet-toolbar/global-model-editor/spreadsheet-model-global-editor.type';

const draggableTabStyles = {
    container: {
        width: 'fit-content',
        display: 'inline-flex',
        mr: 1,
        p: 0,
        minWidth: 'auto',
        flexShrink: 0,
    },
    tab: {
        minWidth: 'auto',
        minHeight: 'auto',
        px: 1,
    },
};

const styles = {
    resetButton: (theme: Theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
    saveButton: (theme: Theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
};

interface SpreadsheetTabsProps {
    selectedTabUuid: UUID | null;
    handleSwitchTab: (tabUuid: UUID) => void;
    disabled: boolean;
    resetNodeAliases: ResetNodeAliasCallback;
    handleResetCollectionClick?: () => void;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (nodeAliases: NodeAlias[]) => void;
}

export const SpreadsheetTabs: FunctionComponent<SpreadsheetTabsProps> = ({
    selectedTabUuid,
    handleSwitchTab,
    disabled,
    resetNodeAliases,
    handleResetCollectionClick,
    nodeAliases,
    updateNodeAliases,
}) => {
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();
    const { snackInfo, snackError } = useSnackMessage();
    const dispatch = useDispatch<AppDispatch>();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const editDialogOpen = useStateBoolean(false);
    const [tabActionInProgressUuid, setTabActionInProgressUuid] = useState<UUID | null>(null);
    const saveCollectionDialogOpen = useStateBoolean(false);

    const selectedTabIndex = useMemo(() => {
        if (!selectedTabUuid) {
            return 0;
        }
        const index = tablesDefinitions.findIndex((tab) => tab.uuid === selectedTabUuid);
        return index >= 0 ? index : 0;
    }, [selectedTabUuid, tablesDefinitions]);

    const handleRemoveTab = () => {
        if (!studyUuid || !tabActionInProgressUuid || !spreadsheetsCollectionUuid) {
            return;
        }

        const tabToBeRemovedIndex = tablesDefinitions.findIndex((def) => def.uuid === tabActionInProgressUuid);
        const tabToBeRemoved = tablesDefinitions[tabToBeRemovedIndex];

        removeSpreadsheetConfigFromCollection(studyUuid, spreadsheetsCollectionUuid, tabActionInProgressUuid)
            .then(() => {
                const remainingTabs = tablesDefinitions.filter((tab) => tab.uuid !== tabActionInProgressUuid);

                // If we're removing the currently selected tab or a tab before it,
                // we need to update the selection
                if (tabActionInProgressUuid === selectedTabUuid) {
                    const newIndex = Math.min(selectedTabIndex, remainingTabs.length - 1);
                    if (newIndex >= 0) {
                        handleSwitchTab(remainingTabs[newIndex].uuid);
                    }
                }

                // Check if there are still tabs of the same type
                const stillHasType = remainingTabs.some((tab) => tab.type === tabToBeRemoved.type);

                dispatch(removeTableDefinition(tabToBeRemovedIndex));
                setConfirmationDialogOpen(false);

                if (!stillHasType) {
                    dispatch(removeEquipmentData(tabToBeRemoved.type));
                }
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'spreadsheet/remove_spreadsheet_error',
                });
            });
    };

    const handleRenameTab = (newName: string) => {
        if (!studyUuid || !tabActionInProgressUuid) {
            return;
        }
        renameSpreadsheetModel(studyUuid, tabActionInProgressUuid, newName)
            .then(() => {
                dispatch(renameTableDefinition(tabActionInProgressUuid, newName));
                setIsRenameDialogOpen(false);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'spreadsheet/rename_spreadsheet_error',
                });
            });
    };

    const handleUpdateTab = (newColumnsModel: columnsModelForm) => {
        if (!studyUuid || !tabActionInProgressUuid || !tableDefinitionInProgress) {
            return;
        }

        const spreadsheetConfig: SpreadsheetConfig = {
            name: tableDefinitionInProgress.name,
            sheetType: tableDefinitionInProgress.type,
            columns: newColumnsModel[COLUMNS_MODEL].map((columnModel) => {
                const column: ColumnDefinitionDto = {
                    uuid: columnModel.columnUuid as UUID,
                    id: columnModel.columnId,
                    name: columnModel.columnName,
                    type: columnModel.columnType,
                    precision: columnModel.columnPrecision,
                    formula: columnModel.columnFormula,
                    dependencies: columnModel.columnDependencies?.length
                        ? JSON.stringify(columnModel.columnDependencies)
                        : undefined,
                    visible: columnModel.columnVisible,
                };
                return column;
            }),
        };

        updateSpreadsheetModel(studyUuid, tableDefinitionInProgress.uuid, spreadsheetConfig)
            .then(() => {
                snackInfo({
                    headerId: 'spreadsheet/global-model-edition/update_confirmation_message',
                });
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'spreadsheet/global-model-edition/update_error_message',
                });
            });
    };

    const handleRemoveTabClick = useCallback(
        (tabUuid: UUID) => {
            setTabActionInProgressUuid(tabUuid);
            setConfirmationDialogOpen(true);
        },
        [setTabActionInProgressUuid, setConfirmationDialogOpen]
    );

    const handleRenameTabClick = useCallback(
        (tabUuid: UUID) => {
            setTabActionInProgressUuid(tabUuid);
            setIsRenameDialogOpen(true);
        },
        [setTabActionInProgressUuid, setIsRenameDialogOpen]
    );

    const handleEditTabClick = useCallback(
        (tabUuid: UUID) => {
            setTabActionInProgressUuid(tabUuid);
            editDialogOpen.setTrue();
        },
        [editDialogOpen]
    );

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            if (!studyUuid || !result.destination || result.destination.index === result.source.index) {
                return;
            }

            const sourceIndex = result.source.index;
            const destinationIndex = result.destination.index;

            // Create a new array with the tabs in the new order
            const reorderedTabs = [...tablesDefinitions];
            const [movedTab] = reorderedTabs.splice(sourceIndex, 1);
            reorderedTabs.splice(destinationIndex, 0, movedTab);

            dispatch(reorderTableDefinitions(reorderedTabs));

            if (spreadsheetsCollectionUuid) {
                const newOrder = reorderedTabs.map((tab) => tab.uuid);
                reorderSpreadsheetConfigs(studyUuid, spreadsheetsCollectionUuid, newOrder).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'spreadsheet/reorder_tabs_error',
                    });
                });
            }
        },
        [studyUuid, tablesDefinitions, dispatch, spreadsheetsCollectionUuid, snackError]
    );

    const renderTabs = useCallback(() => {
        return tablesDefinitions.map((def, index) => (
            <DraggableTab
                key={def.uuid}
                id={def.uuid}
                index={index}
                value={index}
                styles={draggableTabStyles}
                label={
                    <SpreadsheetTabLabel
                        name={def.name}
                        onRemove={() => handleRemoveTabClick(def.uuid)}
                        onRename={() => handleRenameTabClick(def.uuid)}
                        onEdit={() => handleEditTabClick(def.uuid)}
                        disabled={disabled}
                    />
                }
            />
        ));
    }, [tablesDefinitions, disabled, handleEditTabClick, handleRenameTabClick, handleRemoveTabClick]);

    const tabActionInProgressName = useMemo(() => {
        if (!tabActionInProgressUuid) {
            return '';
        }
        const tab = tablesDefinitions.find((tab) => tab.uuid === tabActionInProgressUuid);
        return tab?.name ?? '';
    }, [tabActionInProgressUuid, tablesDefinitions]);

    const tableDefinitionInProgress = useMemo(() => {
        if (!tabActionInProgressUuid) {
            return undefined;
        }
        return tablesDefinitions.find((tab) => tab.uuid === tabActionInProgressUuid);
    }, [tabActionInProgressUuid, tablesDefinitions]);

    const columnsModel: ColumnGlobalModel[] | undefined = useMemo(() => {
        return tableDefinitionInProgress?.columns.map((columnDef) => {
            return {
                columnUuid: columnDef.uuid,
                columnId: columnDef.id,
                columnName: columnDef.name,
                columnType: columnDef.type,
                columnPrecision: columnDef.precision,
                columnFormula: columnDef.formula,
                columnDependencies: columnDef.dependencies,
                columnVisible: columnDef.visible,
            };
        });
    }, [tableDefinitionInProgress]);

    return (
        <>
            <Grid container direction="row" wrap="nowrap" item>
                <Grid item padding={1}>
                    <AddSpreadsheetButton disabled={disabled} resetNodeAliases={resetNodeAliases} />
                </Grid>
                <Grid item sx={{ overflow: 'hidden', flexGrow: 1 }}>
                    <DroppableTabs
                        id="equipment-tabs"
                        value={selectedTabIndex}
                        onChange={(_event, value) => {
                            const tabUuid = tablesDefinitions[value]?.uuid;
                            if (tabUuid) {
                                handleSwitchTab(tabUuid);
                            }
                        }}
                        tabsRender={renderTabs}
                        onDragEnd={handleDragEnd}
                    />
                </Grid>
                <Grid item padding={1}>
                    <NodesConfigButton
                        disabled={disabled}
                        tableType={tablesDefinitions[selectedTabIndex]?.type}
                        nodeAliases={nodeAliases}
                        updateNodeAliases={updateNodeAliases}
                    />
                </Grid>
                <Grid item padding={1}>
                    <Tooltip title={<FormattedMessage id="spreadsheet/collection/save/button_tooltip" />}>
                        <span>
                            <Button
                                sx={styles.saveButton}
                                size={'small'}
                                onClick={() => {
                                    saveCollectionDialogOpen.setTrue();
                                }}
                                disabled={disabled}
                            >
                                <SaveIcon />
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid item padding={1}>
                    <Tooltip title={<FormattedMessage id="spreadsheet/reset_spreadsheet_collection/button_tooltip" />}>
                        <span>
                            <Button
                                sx={styles.resetButton}
                                size={'small'}
                                onClick={handleResetCollectionClick}
                                disabled={disabled}
                            >
                                <RestoreIcon />
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>
            {confirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage(
                        {
                            id: 'spreadsheet/remove_spreadsheet_confirmation',
                        },
                        { spreadsheetName: tabActionInProgressName }
                    )}
                    openConfirmationPopup={confirmationDialogOpen}
                    setOpenConfirmationPopup={setConfirmationDialogOpen}
                    handlePopupConfirmation={handleRemoveTab}
                />
            )}
            <RenameTabDialog
                open={isRenameDialogOpen}
                onClose={() => setIsRenameDialogOpen(false)}
                onRename={handleRenameTab}
                currentName={tabActionInProgressName}
                tabUuid={tabActionInProgressUuid}
                tablesDefinitions={tablesDefinitions}
            />
            <SaveSpreadsheetCollectionDialog open={saveCollectionDialogOpen} nodeAliases={nodeAliases} />
            <SpreadsheetModelGlobalEditorDialog
                open={editDialogOpen}
                columnsModel={columnsModel}
                updateColumnsModel={function (newColumnsModel: columnsModelForm): void {
                    handleUpdateTab(newColumnsModel);
                }}
            />
        </>
    );
};
