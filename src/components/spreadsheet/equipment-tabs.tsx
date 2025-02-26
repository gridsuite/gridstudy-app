/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs, IconButton, Box, Typography } from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import CustomSpreadsheetConfig from './custom-spreadsheet/custom-spreadsheet-config';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import CloseIcon from '@mui/icons-material/Close';
import { AppDispatch } from 'redux/store';
import { removeTableDefinition } from 'redux/actions';
import { removeSpreadsheetConfigFromCollection } from 'services/study-config';
import { PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

interface EquipmentTabsProps {
    tabIndex: number;
    handleSwitchTab: (value: number) => void;
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
            minWidth: theme.spacing(12),
            px: theme.spacing(4),
            '& .MuiIconButton-root': {
                position: 'absolute',
                right: theme.spacing(1),
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

export const EquipmentTabs: FunctionComponent<EquipmentTabsProps> = ({ tabIndex, handleSwitchTab, disabled }) => {
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch<AppDispatch>();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [tabToBeRemovedIndex, setTabToBeRemovedIndex] = useState<number>(tabIndex);
    const handleRemoveTab = () => {
        const tableUuid = tablesDefinitions.find((def) => def.index === tabToBeRemovedIndex)?.uuid;
        if (!tableUuid || !spreadsheetsCollectionUuid) {
            return;
        }
        removeSpreadsheetConfigFromCollection(spreadsheetsCollectionUuid, tableUuid)
            .then(() => {
                if (tabToBeRemovedIndex < tabIndex) {
                    handleSwitchTab(tabIndex - 1);
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

    useEffect(() => {
        if (tabIndex >= tablesDefinitions.length && tabIndex > 0) {
            handleSwitchTab(tabIndex - 1);
        }
    }, [tabIndex, tablesDefinitions.length, handleSwitchTab]);

    const handleRemoveTabClick = (tabIndex: number) => {
        setTabToBeRemovedIndex(tabIndex);
        setConfirmationDialogOpen(true);
    };

    return (
        <>
            <Grid container direction="row" wrap="nowrap" item>
                {developerMode && (
                    <Grid item padding={1}>
                        <CustomSpreadsheetConfig disabled={disabled} />
                    </Grid>
                )}
                <Grid item sx={{ overflow: 'hidden' }}>
                    <Tabs
                        value={tabIndex}
                        variant="scrollable"
                        onChange={(_event, value) => {
                            handleSwitchTab(value);
                        }}
                        aria-label="tables"
                    >
                        {tablesDefinitions.map((def) => (
                            <Tab
                                key={def.name}
                                label={
                                    <TabLabel
                                        name={def.name}
                                        onRemove={() => handleRemoveTabClick(def.index)}
                                        disabled={disabled}
                                    />
                                }
                                disabled={disabled}
                            />
                        ))}
                    </Tabs>
                </Grid>
            </Grid>
            {confirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage(
                        {
                            id: 'spreadsheet/remove_spreadsheet_confirmation',
                        },
                        { spreadsheetName: tablesDefinitions[tabToBeRemovedIndex]?.name }
                    )}
                    openConfirmationPopup={confirmationDialogOpen}
                    setOpenConfirmationPopup={setConfirmationDialogOpen}
                    handlePopupConfirmation={handleRemoveTab}
                />
            )}
        </>
    );
};
