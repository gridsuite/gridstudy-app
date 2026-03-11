/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { PopupConfirmationDialog, snackWithFallback, useSnackMessage, useStateBoolean } from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { setRemoveColumnDefinition } from 'redux/actions';
import { AppDispatch } from 'redux/store';
import { DialogMenuProps } from '../../custom-aggrid/custom-aggrid-menu';
import type { UUID } from 'node:crypto';
import { SpreadsheetTabDefinition } from 'components/spreadsheet-view/types/spreadsheet.type';
import ColumnCreationDialog from './column-creation-dialog';
import { AppState } from 'redux/reducer.type';
import { deleteSpreadsheetColumn, duplicateSpreadsheetColumn } from 'services/study/study-config';

const UPDATE = 'UPDATE';
const DELETE = 'DELETE';
const DUPLICATE = 'DUPLICATE';

const CUSTOM_COLUMNS_MENU_DEFINITION = [
    {
        id: UPDATE,
        label: 'spreadsheet/custom_column/update_custom_column',
    },
    {
        id: DELETE,
        label: 'spreadsheet/custom_column/delete_custom_column',
    },
    {
        id: DUPLICATE,
        label: 'spreadsheet/custom_column/duplicate_custom_column',
    },
];

export interface ColumnMenuProps extends DialogMenuProps {
    tableDefinition: SpreadsheetTabDefinition;
    colUuid: UUID;
}

export const ColumnMenu: FunctionComponent<ColumnMenuProps> = ({
    open,
    tableDefinition,
    colUuid,
    onClose,
    anchorEl,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const dialogOpen = useStateBoolean(false);
    const columnsDefinitions = tableDefinition?.columns;
    const spreadsheetConfigUuid = tableDefinition?.uuid;
    const columnDefinition = useMemo(
        () => columnsDefinitions?.find((column) => column?.uuid === colUuid),
        [colUuid, columnsDefinitions]
    );

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleDuplicate = useCallback(() => {
        if (studyUuid && columnDefinition?.id) {
            duplicateSpreadsheetColumn(studyUuid, spreadsheetConfigUuid, columnDefinition.uuid)
                .then()
                .catch((error) => {
                    snackWithFallback(snackError, error, {
                        headerId: 'spreadsheet/custom_column/duplicate_column_error',
                    });
                });
        }
    }, [columnDefinition, studyUuid, spreadsheetConfigUuid, snackError]);

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
                case DUPLICATE:
                    handleDuplicate();
                    break;
            }
        },
        [dialogOpen, onClose, handleDuplicate]
    );

    const handleValidate = useCallback(() => {
        if (studyUuid && columnDefinition?.id) {
            deleteSpreadsheetColumn(studyUuid, spreadsheetConfigUuid, columnDefinition.uuid)
                .then(() => {
                    setConfirmationDialogOpen(false);
                    dispatch(
                        setRemoveColumnDefinition({
                            uuid: tableDefinition?.uuid,
                            value: columnDefinition?.id,
                        })
                    );
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'spreadsheet/custom_column/delete_column_error' });
                });
        }
    }, [
        columnDefinition?.id,
        columnDefinition?.uuid,
        dispatch,
        snackError,
        spreadsheetConfigUuid,
        studyUuid,
        tableDefinition?.uuid,
    ]);

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
                <ColumnCreationDialog
                    open={dialogOpen}
                    colUuid={colUuid}
                    tableDefinition={tableDefinition}
                    isCreate={false}
                />
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
