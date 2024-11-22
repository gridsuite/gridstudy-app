/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FilledTextFieldProps } from '@mui/material';

export const UPDATE = 'UPDATE';
export const DELETE = 'DELETE';

export const NEW_SPREADSHEET_CREATION_OPTIONS = {
    EMPTY: { id: 'EMPTY', label: 'spreadsheet/create_new_spreadsheet/empty_spreadsheet_option' },
    APPLY_MODEL: { id: 'APPLY_MODEL', label: 'spreadsheet/create_new_spreadsheet/apply_model_option' },
};

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

export const filledTextField: FilledTextFieldProps = {
    variant: 'filled',
};
