/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { FC } from 'react';
import EmptySpreadsheetDialog from './custom-spreadsheet/dialogs/empty-spreadsheet-dialog';
import SpreadsheetFromModelDialog from './custom-spreadsheet/dialogs/spreadsheet-from-model-dialog';
import SpreadsheetCollectionDialog from './custom-spreadsheet/dialogs/spreadsheets-from-collection-dialog';
import { SpreadsheetTabDefinition } from './config/spreadsheet.type';

export const UPDATE = 'UPDATE';
export const DELETE = 'DELETE';

type DialogComponent = FC<{
    open: UseStateBooleanReturn;
    resetTabIndex: (newTablesDefinitions: SpreadsheetTabDefinition[]) => void;
}>;

export interface SpreadsheetOption {
    id: string;
    label: string;
    dialog: DialogComponent;
}

/**
 * Constants for spreadsheet creation options with associated dialog components
 */
export const NEW_SPREADSHEET_CREATION_OPTIONS: Record<string, SpreadsheetOption> = {
    EMPTY: {
        id: 'EMPTY',
        label: 'spreadsheet/create_new_spreadsheet/empty_spreadsheet_option',
        dialog: EmptySpreadsheetDialog,
    },
    APPLY_MODEL: {
        id: 'APPLY_MODEL',
        label: 'spreadsheet/create_new_spreadsheet/apply_model_option',
        dialog: SpreadsheetFromModelDialog,
    },
    APPLY_COLLECTION: {
        id: 'APPLY_COLLECTION',
        label: 'spreadsheet/create_new_spreadsheet/apply_collection_option',
        dialog: SpreadsheetCollectionDialog,
    },
};

export const MATHJS_LINK = 'https://mathjs.org/index.html';

export const CUSTOM_COLUMNS_MENU_DEFINITION = [
    {
        id: UPDATE,
        label: 'spreadsheet/custom_column/update_custom_column',
    },
    {
        id: DELETE,
        label: 'spreadsheet/custom_column/delete_custom_column',
    },
];
