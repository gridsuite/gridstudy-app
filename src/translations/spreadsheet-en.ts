/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const spreadsheetFr = {
    'spreadsheet/custom_column/main_button': 'Add customized columns',
    'spreadsheet/custom_column/save': 'Enregistrer',
    'spreadsheet/custom_column/dialog/title': 'Manage formulas',
    'spreadsheet/custom_column/dialog/close_tooltip':
        'Close{isContentModified, select, true { without saving change(s)} other {}}',
    'spreadsheet/custom_column/dialog/add_column': 'Add column',
    'spreadsheet/custom_column/dialog/import_export': 'Import/Export formulas',
    'spreadsheet/custom_column/dialog/import_err': 'Error while importing',
    'spreadsheet/custom_column/import': 'Import',
    'spreadsheet/custom_column/reset': 'Reset',
    'spreadsheet/custom_column/copy': 'Copy to clipboard',
    'spreadsheet/custom_column/paste': 'Paste from clipboard',
    'spreadsheet/custom_column/ok': 'OK',
    'spreadsheet/custom_column/dialog_edit/title_add': 'New Formula',
    'spreadsheet/custom_column/dialog_edit/title_edit': 'Edit formula',
    'spreadsheet/custom_column/dialog_edit/placeholder': 'Enter the formula here',
    'spreadsheet/custom_column/dialog_edit/name': 'Name',
    'spreadsheet/custom_column/dialog_edit/name_description': 'Name of the formula',
    'spreadsheet/custom_column/dialog_edit/name_invalid': 'Invalid formula name',
    'spreadsheet/custom_column/dialog_edit/functions_tooltip': 'List of functions',
    'spreadsheet/custom_column/dialog_edit/submit_error': 'Invalid definition',
    'spreadsheet/custom_column/column_name': 'Column name',
    'spreadsheet/custom_column/column_content': 'Column content',
    'spreadsheet/custom_column/column_content_tooltip': `Column content is described with variable names (in order to reference grid data) and operators provided by MathJS library (in order to transform grid data). Example: maxP - p in order to display active power reserve within the generator spreadsheet`,
};

export default spreadsheetFr;
