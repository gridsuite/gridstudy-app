/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { Button, type ButtonProps, Menu, MenuItem, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { type MuiStyles, useStateBoolean } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl';
import { ResetNodeAliasCallback } from '../hooks/use-node-aliases';
import AddEmptySpreadsheetDialog from './dialogs/add-empty-spreadsheet-dialog';
import AddSpreadsheetFromModelDialog from './dialogs/add-spreadsheet-from-model-dialog';
import AddSpreadsheetsFromCollectionDialog from './dialogs/add-spreadsheets-from-collection-dialog';
import type { DialogComponent } from './types';

export type AddSpreadsheetButtonProps = {
    disabled: boolean;
    resetNodeAliases: ResetNodeAliasCallback;
};

const styles = {
    addButton: (theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
} as const satisfies MuiStyles;

export interface SpreadsheetOption {
    id: string;
    label: string;
    dialog: DialogComponent;
}

/**
 * Constants for spreadsheet creation options with associated dialog components
 */
const NEW_SPREADSHEET_CREATION_OPTIONS = {
    EMPTY: {
        id: 'EMPTY',
        label: 'spreadsheet/create_new_spreadsheet/empty_spreadsheet_option',
        dialog: AddEmptySpreadsheetDialog,
    },
    APPLY_MODEL: {
        id: 'APPLY_MODEL',
        label: 'spreadsheet/create_new_spreadsheet/apply_model_option',
        dialog: AddSpreadsheetFromModelDialog,
    },
    APPLY_COLLECTION: {
        id: 'APPLY_COLLECTION',
        label: 'spreadsheet/create_new_spreadsheet/apply_collection_option',
        dialog: AddSpreadsheetsFromCollectionDialog,
    },
} as const satisfies Record<string, SpreadsheetOption>;

export default function AddSpreadsheetButton({ disabled, resetNodeAliases }: Readonly<AddSpreadsheetButtonProps>) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const dialogOpen = useStateBoolean(false);
    const [selectedOption, setSelectedOption] = useState<SpreadsheetOption | undefined>();

    const handleClick = useCallback<NonNullable<ButtonProps['onClick']>>(
        (event) => setAnchorEl(event.currentTarget),
        []
    );

    const handleClose = useCallback(() => setAnchorEl(null), []);

    const handleMenuItemClick = useCallback(
        (option: SpreadsheetOption) => {
            setSelectedOption(option);
            dialogOpen.setTrue();
            handleClose();
        },
        [dialogOpen, handleClose]
    );

    const SelectedDialog = selectedOption?.dialog;

    return (
        <>
            <Tooltip title={<FormattedMessage id="spreadsheet/create_new_spreadsheet/add_button_tooltip" />}>
                <span>
                    <Button onClick={handleClick} disabled={disabled} sx={styles.addButton} size={'small'}>
                        <AddIcon />
                    </Button>
                </span>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {Object.values(NEW_SPREADSHEET_CREATION_OPTIONS).map((option) => (
                    <MenuItem key={option.id} onClick={() => handleMenuItemClick(option)}>
                        {<FormattedMessage id={option.label} />}
                    </MenuItem>
                ))}
            </Menu>
            {SelectedDialog && <SelectedDialog open={dialogOpen} resetNodeAliases={resetNodeAliases} />}
        </>
    );
}
