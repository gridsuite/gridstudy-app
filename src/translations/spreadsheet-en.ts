/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const spreadsheetEn = {
    'spreadsheet/column/button': 'Show / hide columns',
    'spreadsheet/column/dialog/title': 'Column list',
    'spreadsheet/column/dialog/check_all': 'Select all / none',
    'spreadsheet/custom_column/add_columns': 'Add a column',
    'spreadsheet/custom_column/edit_columns': 'Edit a column',
    'spreadsheet/custom_column/column_name': 'Column name',
    'spreadsheet/custom_column/column_id': 'Column ID',
    'spreadsheet/custom_column/column_dependencies': 'Enter formula dependencies',
    'spreadsheet/custom_column/column_content': 'Enter the formula',
    'spreadsheet/custom_column/column_content_description': `Column content is described with variable names (in order to reference grid data) and operators provided by <Link>MathJS</Link> library (in order to transform grid data). Example: maxP - p in order to display active power reserve within the generator spreadsheet`,
    'spreadsheet/custom_column/error/id_not_conform': 'Column ID must not contain spaces or $ symbols',
    'spreadsheet/custom_column/error/id_le_60': 'Column ID must be at most 60 characters',
    'spreadsheet/custom_column/error/name_le_60': 'Column name must be at most 60 characters',
    'spreadsheet/custom_column/update_custom_column': 'Update column',
    'spreadsheet/custom_column/delete_custom_column': 'Delete column',
    'spreadsheet/custom_column/delete_custom_column_confirmation':
        'Are you sure you want to delete the column "{columnName}"?',
    'spreadsheet/custom_column/column_id_already_exist': 'Column id already exists',
    'spreadsheet/custom_column/dependencies': 'The formula is linked to other columns',
    'spreadsheet/custom_column/nodes': 'Nodes',
    'spreadsheet/custom_column/parameter_nodes': 'Parameter nodes aliases',
    'spreadsheet/custom_column/add_alias': 'Add an alias',
    'spreadsheet/custom_column/creates_cyclic_dependency': 'Column dependencies create a cyclic dependency',
    'spreadsheet/save/button': 'Save',
    'spreadsheet/save/options/model': 'As a model',
    'spreadsheet/save/options/csv': 'Export CSV',
    'spreadsheet/save/dialog_title': 'Save a spreadsheet model',
    'spreadsheet/save/error_message': 'Spreadsheet model creation error',
    'spreadsheet/save/confirmation_message': 'Spreadsheet model created in {folderName}',
    'spreadsheet/create_new_spreadsheet/create_empty_spreadsheet': 'Create an empty spreadsheet',
    'spreadsheet/create_new_spreadsheet/apply_spreadsheet_model': 'Apply a spreadsheet model',
    'spreadsheet/create_new_spreadsheet/add_button_tooltip': 'Add spreadsheet',
    'spreadsheet/create_new_spreadsheet/empty_spreadsheet_option': 'Add a sheet',
    'spreadsheet/create_new_spreadsheet/apply_model_option': 'Select a model',
    'spreadsheet/create_new_spreadsheet/select_spreadsheet_model': 'Spreadsheet model',
    'spreadsheet/create_new_spreadsheet/spreadsheet_name': 'Spreadsheet name',
    'spreadsheet/create_new_spreadsheet/equipment_type': 'Equipment type',
    'spreadsheet/create_new_spreadsheet/spreadsheet_name_already_exists': 'Spreadsheet name already exists',
    'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_model': 'You must select a spreadsheet model',
    'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_model':
        'You must select only one spreadsheet model',
    'spreadsheet/create_new_spreadsheet/error_loading_model': 'Error while retrieving spreadsheet model',
    'spreadsheet/parameter_aliases/node_name': 'Node name',
    'spreadsheet/parameter_aliases/node_alias': 'Node alias',
    'spreadsheet/parameter_aliases/max_characters_reached': 'Cannot exceed 10 characters',
    'spreadsheet/parameter_aliases/no_special_characters': 'No special characters allowed',
    'spreadsheet/parameter_aliases/node_doesnt_exist': 'No node with this name',
    'spreadsheet/parameter_aliases/unique_aliases': 'Aliases should be unique',
};

export default spreadsheetEn;
