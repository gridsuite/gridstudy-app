/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, IconButton, Box, Typography } from '@mui/material';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import CustomSpreadsheetConfig from './custom-spreadsheet/custom-spreadsheet-config';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import CloseIcon from '@mui/icons-material/Close';
import { AppDispatch } from 'redux/store';
import { removeTableDefinition, reorderTableDefinitions } from 'redux/actions';
import { removeSpreadsheetConfigFromCollection, reorderSpreadsheetConfigs } from 'services/study-config';
import { PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { DropResult } from 'react-beautiful-dnd';
import DroppableTabs from 'components/utils/draggable-tab/droppable-tabs';
import DraggableTab from 'components/utils/draggable-tab/draggable-tab';
import { UUID } from 'crypto';

interface EquipmentTabsProps {
    selectedTabUuid: UUID | null;
    handleSwitchTab: (tabUuid: UUID) => void;
    disabled: boolean;
}

const TabLabel: React.FC<{ name: string; onRemove: () => void; disabled: boolean }> = ({
    name,
    onRemove,
    disabled,
}) => (
    <Box
        sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            width: '100%',
            minWidth: theme.spacing(4),
            px: theme.spacing(1),
            '& .MuiIconButton-root': {
                position: 'absolute',
                right: theme.spacing(-1.5),
                opacity: 0,
            },
            '&:hover': {
                '& .MuiIconButton-root': {
                    opacity: 1,
                },
                '& .MuiTypography-root': {
                    transform: `translateX(-${theme.spacing(2)})`,
                },
            },
        })}
    >
        <Typography
            variant="inherit"
            sx={{
                width: '100%',
                textAlign: 'center',
            }}
        >
            {name}
        </Typography>
        <IconButton
            size="small"
            onClick={(e) => {
                e.stopPropagation();
                onRemove();
            }}
            disabled={disabled}
        >
            <CloseIcon fontSize="small" />
        </IconButton>
    </Box>
);

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
    const [tabToBeRemovedUuid, setTabToBeRemovedUuid] = useState<UUID | null>(null);

    const selectedTabIndex = useMemo(() => {
        if (!selectedTabUuid) {
            return 0;
        }
        const index = tablesDefinitions.findIndex((tab) => tab.uuid === selectedTabUuid);
        return index >= 0 ? index : 0;
    }, [selectedTabUuid, tablesDefinitions]);

    const handleRemoveTab = () => {
        if (!tabToBeRemovedUuid || !spreadsheetsCollectionUuid) {
            return;
        }

        const tabToBeRemovedIndex = tablesDefinitions.findIndex((def) => def.uuid === tabToBeRemovedUuid);

        removeSpreadsheetConfigFromCollection(spreadsheetsCollectionUuid, tabToBeRemovedUuid)
            .then(() => {
                // If we're removing the currently selected tab or a tab before it,
                // we need to update the selection
                if (tabToBeRemovedUuid === selectedTabUuid) {
                    // Select the next tab, or the previous if this is the last tab
                    const newIndex = Math.min(selectedTabIndex, tablesDefinitions.length - 2);
                    if (newIndex >= 0) {
                        handleSwitchTab(tablesDefinitions[newIndex].uuid);
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

    const handleRemoveTabClick = (tabUuid: UUID) => {
        setTabToBeRemovedUuid(tabUuid);
        setConfirmationDialogOpen(true);
    };

    const resetTabSelection = useCallback(() => {
        if (tablesDefinitions.length > 0) {
            handleSwitchTab(tablesDefinitions[0].uuid);
        }
    }, [handleSwitchTab, tablesDefinitions]);

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
                label={<TabLabel name={def.name} onRemove={() => handleRemoveTabClick(def.uuid)} disabled={disabled} />}
            />
        ));
    }, [tablesDefinitions, disabled]);

    const tabToBeRemovedName = useMemo(() => {
        if (!tabToBeRemovedUuid) {
            return '';
        }
        const tab = tablesDefinitions.find((tab) => tab.uuid === tabToBeRemovedUuid);
        return tab?.name || '';
    }, [tabToBeRemovedUuid, tablesDefinitions]);

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
                        { spreadsheetName: tabToBeRemovedName }
                    )}
                    openConfirmationPopup={confirmationDialogOpen}
                    setOpenConfirmationPopup={setConfirmationDialogOpen}
                    handlePopupConfirmation={handleRemoveTab}
                />
            )}
        </>
    );
};
