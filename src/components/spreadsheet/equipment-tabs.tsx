/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import CustomSpreadsheetConfig from './custom-spreadsheet/custom-spreadsheet-config';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { AppDispatch } from 'redux/store';
import { removeTableDefinition, renameTableDefinition, reorderTableDefinitions } from 'redux/actions';
import {
    removeSpreadsheetConfigFromCollection,
    renameSpreadsheetModel,
    reorderSpreadsheetConfigs,
} from 'services/study-config';
import { PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { DropResult } from 'react-beautiful-dnd';
import DroppableTabs from 'components/utils/draggable-tab/droppable-tabs';
import DraggableTab from 'components/utils/draggable-tab/draggable-tab';
import { UUID } from 'crypto';
import { SpreadsheetTabDefinition } from './config/spreadsheet.type';
import RenameTabDialog from './rename-tab-dialog';
import TabLabel from './tab-label';

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

interface EquipmentTabsProps {
    selectedTabUuid: UUID | null;
    handleSwitchTab: (tabUuid: UUID) => void;
    disabled: boolean;
}

export const EquipmentTabs: FunctionComponent<EquipmentTabsProps> = ({
    selectedTabUuid,
    handleSwitchTab,
    disabled,
}) => {
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);
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
        if (!tabToBeRemovedOrRenamedUuid || !spreadsheetsCollectionUuid) {
            return;
        }

        const tabToBeRemovedIndex = tablesDefinitions.findIndex((def) => def.uuid === tabToBeRemovedOrRenamedUuid);

        removeSpreadsheetConfigFromCollection(spreadsheetsCollectionUuid, tabToBeRemovedOrRenamedUuid)
            .then(() => {
                // If we're removing the currently selected tab or a tab before it,
                // we need to update the selection
                if (tabToBeRemovedOrRenamedUuid === selectedTabUuid) {
                    const remainingTabs = tablesDefinitions.filter((tab) => tab.uuid !== tabToBeRemovedOrRenamedUuid);
                    // Select the next tab, or the previous if this is the last tab
                    const newIndex = Math.min(selectedTabIndex, remainingTabs.length - 1);
                    if (newIndex >= 0) {
                        handleSwitchTab(remainingTabs[newIndex].uuid);
                    }
                }
                dispatch(removeTableDefinition(tabToBeRemovedIndex));
                setConfirmationDialogOpen(false);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'spreadsheet/remove_spreadsheet_error',
                });
            });
    };

    const handleRenameTab = (newName: string) => {
        if (!tabToBeRemovedOrRenamedUuid) {
            return;
        }
        renameSpreadsheetModel(tabToBeRemovedOrRenamedUuid, newName)
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
            if (!result.destination || result.destination.index === result.source.index) {
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
                reorderSpreadsheetConfigs(spreadsheetsCollectionUuid, newOrder).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'spreadsheet/reorder_tabs_error',
                    });
                });
            }
        },
        [tablesDefinitions, dispatch, spreadsheetsCollectionUuid, snackError]
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
                    <TabLabel
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
                {developerMode && (
                    <Grid item padding={1}>
                        <CustomSpreadsheetConfig disabled={disabled} resetTabIndex={resetTabSelection} />
                    </Grid>
                )}
                <Grid item sx={{ overflow: 'hidden' }}>
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
