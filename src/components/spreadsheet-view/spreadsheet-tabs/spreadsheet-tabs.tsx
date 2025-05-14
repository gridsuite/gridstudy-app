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
import { PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl';
import { DropResult } from '@hello-pangea/dnd';
import DroppableTabs from 'components/utils/draggable-tab/droppable-tabs';
import DraggableTab from 'components/utils/draggable-tab/draggable-tab';
import { UUID } from 'crypto';
import { SpreadsheetTabDefinition } from '../types/spreadsheet.type';
import RenameTabDialog from './rename-tab-dialog';
import SpreadsheetTabLabel from './spreadsheet-tab-label';
import { ResetNodeAliasCallback } from '../hooks/use-node-aliases';
import RestoreIcon from '@mui/icons-material/Restore';
import {
    removeSpreadsheetConfigFromCollection,
    renameSpreadsheetModel,
    reorderSpreadsheetConfigs,
} from 'services/study/study-config';

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
    }),
};

interface SpreadsheetTabsProps {
    selectedTabUuid: UUID | null;
    handleSwitchTab: (tabUuid: UUID) => void;
    disabled: boolean;
    resetNodeAliases: ResetNodeAliasCallback;
    handleResetCollectionClick?: () => void;
}

export const SpreadsheetTabs: FunctionComponent<SpreadsheetTabsProps> = ({
    selectedTabUuid,
    handleSwitchTab,
    disabled,
    resetNodeAliases,
    handleResetCollectionClick,
}) => {
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch<AppDispatch>();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [tabToBeRemovedOrRenamedUuid, setTabToBeRemovedOrRenamedUuid] = useState<UUID | null>(null);

    const selectedTabIndex = useMemo(() => {
        if (!selectedTabUuid) {
            return 0;
        }
        const index = tablesDefinitions.findIndex((tab) => tab.uuid === selectedTabUuid);
        return index >= 0 ? index : 0;
    }, [selectedTabUuid, tablesDefinitions]);

    const handleRemoveTab = () => {
        if (!studyUuid || !tabToBeRemovedOrRenamedUuid || !spreadsheetsCollectionUuid) {
            return;
        }

        const tabToBeRemovedIndex = tablesDefinitions.findIndex((def) => def.uuid === tabToBeRemovedOrRenamedUuid);
        const tabToBeRemoved = tablesDefinitions[tabToBeRemovedIndex];

        removeSpreadsheetConfigFromCollection(studyUuid, spreadsheetsCollectionUuid, tabToBeRemovedOrRenamedUuid)
            .then(() => {
                const remainingTabs = tablesDefinitions.filter((tab) => tab.uuid !== tabToBeRemovedOrRenamedUuid);

                // If we're removing the currently selected tab or a tab before it,
                // we need to update the selection
                if (tabToBeRemovedOrRenamedUuid === selectedTabUuid) {
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
        if (!studyUuid || !tabToBeRemovedOrRenamedUuid) {
            return;
        }
        renameSpreadsheetModel(studyUuid, tabToBeRemovedOrRenamedUuid, newName)
            .then(() => {
                dispatch(renameTableDefinition(tabToBeRemovedOrRenamedUuid, newName));
                setIsRenameDialogOpen(false);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'spreadsheet/rename_spreadsheet_error',
                });
            });
    };

    const handleRemoveTabClick = (tabUuid: UUID) => {
        setTabToBeRemovedOrRenamedUuid(tabUuid);
        setConfirmationDialogOpen(true);
    };

    const handleRenameTabClick = (tabUuid: UUID) => {
        setTabToBeRemovedOrRenamedUuid(tabUuid);
        setIsRenameDialogOpen(true);
    };

    const resetTabSelection = useCallback(
        (newTablesDefinitions: SpreadsheetTabDefinition[]) => {
            if (newTablesDefinitions.length > 0) {
                handleSwitchTab(newTablesDefinitions[0].uuid);
            }
        },
        [handleSwitchTab]
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
                        disabled={disabled}
                    />
                }
            />
        ));
    }, [tablesDefinitions, disabled]);

    const tabToBeRemovedOrRenamedName = useMemo(() => {
        if (!tabToBeRemovedOrRenamedUuid) {
            return '';
        }
        const tab = tablesDefinitions.find((tab) => tab.uuid === tabToBeRemovedOrRenamedUuid);
        return tab?.name ?? '';
    }, [tabToBeRemovedOrRenamedUuid, tablesDefinitions]);

    return (
        <>
            <Grid container direction="row" wrap="nowrap" item>
                <Grid item padding={1}>
                    <AddSpreadsheetButton
                        disabled={disabled}
                        resetTabIndex={resetTabSelection}
                        resetNodeAliases={resetNodeAliases}
                    />
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
                        { spreadsheetName: tabToBeRemovedOrRenamedName }
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
                currentName={tabToBeRemovedOrRenamedName}
                tabUuid={tabToBeRemovedOrRenamedUuid}
                tablesDefinitions={tablesDefinitions}
            />
        </>
    );
};
