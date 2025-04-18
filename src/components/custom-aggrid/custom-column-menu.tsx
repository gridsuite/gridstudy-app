/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { PopupConfirmationDialog, useSnackMessage, useStateBoolean } from '@gridsuite/commons-ui';
import { CUSTOM_COLUMNS_MENU_DEFINITION, DELETE, UPDATE } from '../spreadsheet/constants';
import { FormattedMessage, useIntl } from 'react-intl';
import CustomColumnDialog from '../spreadsheet/custom-columns/custom-columns-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { setRemoveColumnDefinition } from 'redux/actions';
import { AppDispatch } from 'redux/store';
import { DialogMenuProps } from './custom-aggrid-menu';
import { deleteSpreadsheetColumn } from 'services/study-config';
import { UUID } from 'crypto';

export interface CustomColumnConfigProps extends DialogMenuProps {
    tabIndex: number;
    colUuid: UUID;
}

export const CustomColumnMenu: React.FC<CustomColumnConfigProps> = ({ open, tabIndex, colUuid, onClose, anchorEl }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const dialogOpen = useStateBoolean(false);
    const columnsDefinitions = useSelector((state: AppState) => state.tables.definitions[tabIndex]?.columns);
    const spreadsheetConfigUuid = useSelector((state: AppState) => state.tables.definitions[tabIndex]?.uuid);
    const columnDefinition = useMemo(
        () => columnsDefinitions?.find((column) => column?.uuid === colUuid),
        [colUuid, columnsDefinitions]
    );

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleMenuItemClick = useCallback(
        (option: { id: string; label: string }) => {
            onClose();
            switch (option.id) {
                case UPDATE:
                    dialogOpen.setTrue();
                    break;
                case DELETE:
                    setConfirmationDialogOpen(true);
                    break;
            }
        },
        [dialogOpen, onClose]
    );

    const handleValidate = useCallback(() => {
        if (columnDefinition?.id) {
            deleteSpreadsheetColumn(spreadsheetConfigUuid, columnDefinition.uuid)
                .then(() => {
                    setConfirmationDialogOpen(false);
                    dispatch(
                        setRemoveColumnDefinition({
                            index: tabIndex,
                            value: columnDefinition?.id,
                        })
                    );
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerTxt: 'spreadsheet/custom_column/delete_column_error',
                    });
                });
        }
    }, [columnDefinition?.id, columnDefinition?.uuid, dispatch, snackError, spreadsheetConfigUuid, tabIndex]);

    return (
        <>
            <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
                {Object.values(CUSTOM_COLUMNS_MENU_DEFINITION).map((option) => (
                    <MenuItem
                        key={option.id}
                        onClick={() => {
                            handleMenuItemClick(option);
                        }}
                    >
                        {<FormattedMessage id={option.label} />}
                    </MenuItem>
                ))}
            </Menu>

            {dialogOpen.value && (
                <CustomColumnDialog open={dialogOpen} colUuid={colUuid} tabIndex={tabIndex} isCreate={false} />
            )}
            {confirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage(
                        {
                            id: 'spreadsheet/custom_column/delete_custom_column_confirmation',
                        },
                        { columnName: columnDefinition?.name }
                    )}
                    openConfirmationPopup={confirmationDialogOpen}
                    setOpenConfirmationPopup={setConfirmationDialogOpen}
                    handlePopupConfirmation={handleValidate}
                />
            )}
        </>
    );
};
