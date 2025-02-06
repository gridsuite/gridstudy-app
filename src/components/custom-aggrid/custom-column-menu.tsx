/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { PopupConfirmationDialog, useStateBoolean } from '@gridsuite/commons-ui';
import { CUSTOM_COLUMNS_MENU_DEFINITION, DELETE, UPDATE } from '../spreadsheet/constants';
import { FormattedMessage, useIntl } from 'react-intl';
import CustomColumnDialog from '../spreadsheet/custom-columns/custom-columns-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { setRemoveCustomColumDefinitions } from 'redux/actions';
import { AppDispatch } from 'redux/store';
import { DialogMenuProps } from './custom-aggrid-menu';

export interface CustomColumnConfigProps extends DialogMenuProps {
    tabIndex: number;
    customColumnName: string;
}

export const CustomColumnMenu: React.FC<CustomColumnConfigProps> = ({
    open,
    tabIndex,
    customColumnName,
    onClose,
    anchorEl,
}) => {
    const intl = useIntl();
    const dialogOpen = useStateBoolean(false);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tabIndex]
    );
    const customColumnDefinition = useMemo(
        () => customColumnsDefinitions.find((column) => column.name === customColumnName),
        [customColumnName, customColumnsDefinitions]
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
        if (customColumnDefinition?.id) {
            setConfirmationDialogOpen(false);
            dispatch(
                setRemoveCustomColumDefinitions({
                    index: tabIndex,
                    value: customColumnDefinition?.id,
                })
            );
        }
    }, [customColumnDefinition?.id, dispatch, tabIndex]);

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
                <CustomColumnDialog
                    open={dialogOpen}
                    customColumnName={customColumnName}
                    tabIndex={tabIndex}
                    isCreate={false}
                />
            )}
            {confirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage(
                        {
                            id: 'spreadsheet/custom_column/delete_custom_column_confirmation',
                        },
                        { columnName: customColumnDefinition?.name }
                    )}
                    openConfirmationPopup={confirmationDialogOpen}
                    setOpenConfirmationPopup={setConfirmationDialogOpen}
                    handlePopupConfirmation={handleValidate}
                />
            )}
        </>
    );
};
