/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { PopupConfirmationDialog, useStateBoolean } from '@gridsuite/commons-ui';
import { CUSTOM_COLUMNS_MENU_DEFINITION, DELETE, UPDATE } from '../constants';
import { FormattedMessage, useIntl } from 'react-intl';
import CustomColumnDialog from './custom-columns-dialog';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { ColumnWithFormula } from 'types/custom-columns.types';
import { setRemoveCustomColumDefinitions } from 'redux/actions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'redux/store';

export interface CustomColumnConfigProps {
    open: boolean;
    tabIndex: number;
    customColumnName: string;
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

const CustomColumnMenu: React.FC<CustomColumnConfigProps> = ({
    open,
    tabIndex,
    customColumnName,
    onClose,
    anchorEl,
}) => {
    const intl = useIntl();
    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const dialogOpen = useStateBoolean(false);
    const [customColumnsDefinition, setCustomColumnsDefinition] = useState<ColumnWithFormula>();
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tablesNames[tabIndex]]?.columns
    );

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleMenuItemClick = useCallback(
        (option: { id: string; label: string }) => {
            setCustomColumnsDefinition(customColumnsDefinitions.find((column) => column.name === customColumnName));
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
        [customColumnName, customColumnsDefinitions, dialogOpen, onClose]
    );

    const handleValidate = useCallback(() => {
        if (customColumnsDefinition?.id) {
            setConfirmationDialogOpen(false);
            dispatch(setRemoveCustomColumDefinitions(tablesNames[tabIndex], customColumnsDefinition?.id));
        }
    }, [customColumnsDefinition?.id, dispatch, tabIndex, tablesNames]);

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
                    tabIndex={tabIndex}
                    customColumnsDefinition={customColumnsDefinition}
                    customColumnsDefinitions={customColumnsDefinitions}
                    isCreate={false}
                />
            )}
            {confirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage(
                        {
                            id: 'spreadsheet/custom_column/delete_custom_column_confirmation',
                        },
                        { columnName: customColumnsDefinition?.name }
                    )}
                    openConfirmationPopup={confirmationDialogOpen}
                    setOpenConfirmationPopup={setConfirmationDialogOpen}
                    handlePopupConfirmation={handleValidate}
                />
            )}
        </>
    );
};

export default CustomColumnMenu;
