/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const spreadsheetEn = {
    'spreadsheet/column/button': 'Show / hide columns',
    'spreadsheet/column/dialog/title': 'Column list',
    'spreadsheet/collection/save/title': 'Spreadsheets list',
    'spreadsheet/column/dialog/check_all': 'Select all / none',
    'spreadsheet/custom_column/add_columns': 'Add a column',
    'spreadsheet/custom_column/edit_columns': 'Edit a column',
    'spreadsheet/custom_column/column_name': 'Column name',
    'spreadsheet/custom_column/column_id': 'Column ID',
    'spreadsheet/custom_column/column_dependencies': 'Enter formula dependencies',
    'spreadsheet/custom_column/column_type': 'Column type',
    'spreadsheet/custom_column/column_precision': 'Column precision',
    'spreadsheet/custom_column/column_content': 'Enter the formula',
    'spreadsheet/custom_column/column_content_description': `Column content is described with variable names (in order to reference grid data), column IDs (in order to reference the content of another column) and operators provided by <Link>MathJS</Link> library (in order to transform grid data). Example: maxP - p in order to display active power reserve within the generator spreadsheet`,
    'spreadsheet/custom_column/error/id_not_conform':
        'Column ID must not contain spaces, special characters or start with a number',
    'spreadsheet/custom_column/error/id_le_60': 'Column ID must be at most 60 characters',
    'spreadsheet/custom_column/error/name_le_60': 'Column name must be at most 60 characters',
    'spreadsheet/custom_column/update_custom_column': 'Update column',
    'spreadsheet/custom_column/delete_custom_column': 'Delete column',
    'spreadsheet/custom_column/delete_custom_column_confirmation':
        'Are you sure you want to delete the column "{columnName}"?',
    'spreadsheet/custom_column/delete_column_error': 'Error while deleting column',
    'spreadsheet/custom_column/column_id_already_exist': 'Column id already exists',
    'spreadsheet/custom_column/column_name_already_exist': 'Column name already exists',
    'spreadsheet/custom_column/dependencies': 'The formula is linked to other columns',
    'spreadsheet/custom_column/nodes': 'Nodes',
    'spreadsheet/custom_column/option/parameter': 'Configure',
    'spreadsheet/custom_column/option/refresh': 'Reload',
    'spreadsheet/custom_column/option/refresh/tooltip':
        'Reload data for current sheet for other configured nodes ({aliases})',
    'spreadsheet/custom_column/parameter_nodes': 'Configure nodes aliases',
    'spreadsheet/custom_column/add_alias': 'Add an alias',
    'spreadsheet/custom_column/creates_cyclic_dependency': 'Column dependencies create a cyclic dependency',
    'spreadsheet/custom_column/error_saving_or_updating_column': 'Error while saving or updating column',
    'spreadsheet/save/button': 'Save',
    'spreadsheet/reset/button': 'Reset',
    'spreadsheet/save/options/model': 'As a model',
    'spreadsheet/save/options/collection': 'Collection',
    'spreadsheet/save/options/csv': 'Export CSV',
    'spreadsheet/save/dialog_title': 'Save a spreadsheet model',
    'spreadsheet/collection/save/collection_name_dialog_title': 'Save a spreadsheet collection',
    'spreadsheet/save/error_message': 'Spreadsheet model creation error',
    'spreadsheet/collection/save/error': 'Spreadsheet collection creation error',
    'spreadsheet/save/confirmation_message': 'Spreadsheet model created in {folderName}',
    'spreadsheet/collection/save/success': 'Spreadsheet collection created in {folderName}',
    'spreadsheet/create_new_spreadsheet/create_empty_spreadsheet': 'Create an empty spreadsheet',
    'spreadsheet/create_new_spreadsheet/apply_spreadsheet_model': 'Apply a spreadsheet model',
    'spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection': 'Apply a spreadsheet collection',
    'spreadsheet/create_new_spreadsheet/replace_collection_confirmation':
        "You are about to replace the current content of the 'Spreadsheet' tab. This content will be lost if you do not save it to GridExplore first. Would you like to pursue without saving the current content?",
    'spreadsheet/create_new_spreadsheet/add_button_tooltip': 'Add spreadsheet',
    'spreadsheet/create_new_spreadsheet/empty_spreadsheet_option': 'Add a sheet',
    'spreadsheet/create_new_spreadsheet/apply_model_option': 'Select a model',
    'spreadsheet/create_new_spreadsheet/apply_collection_option': 'Select a collection',
    'spreadsheet/create_new_spreadsheet/select_spreadsheet_model': 'Spreadsheet model',
    'spreadsheet/create_new_spreadsheet/select_spreadsheet_collection': 'Spreadsheet collection',
    'spreadsheet/create_new_spreadsheet/spreadsheet_name': 'Spreadsheet name',
    'spreadsheet/create_new_spreadsheet/equipment_type': 'Equipment type',
    'spreadsheet/create_new_spreadsheet/spreadsheet_name_already_exists': 'Spreadsheet name already exists',
    'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_model': 'You must select a spreadsheet model',
    'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_collection': 'You must select a spreadsheet collection',
    'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_model':
        'You must select only one spreadsheet model',
    'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_collection':
        'You must select only one spreadsheet collection',
    'spreadsheet/create_new_spreadsheet/error_loading_model': 'Error while retrieving spreadsheet model',
    'spreadsheet/create_new_spreadsheet/error_loading_collection': 'Error while retrieving spreadsheet collection',
    'spreadsheet/create_new_spreadsheet/error_adding_spreadsheet': 'Error while adding spreadsheet',
    'spreadsheet/reset_spreadsheet_collection/error_resetting_collection':
        'Error while resetting spreadsheet collection',
    'spreadsheet/parameter_aliases/node_name': 'Node name',
    'spreadsheet/parameter_aliases/node_alias': 'Node alias',
    'spreadsheet/parameter_aliases/max_characters_reached': 'Cannot exceed 10 characters',
    'spreadsheet/parameter_aliases/no_special_characters': 'No special characters allowed',
    'spreadsheet/parameter_aliases/node_doesnt_exist': 'No node with this name',
    'spreadsheet/parameter_aliases/unique_aliases': 'Aliases should be unique',
    'spreadsheet/parameter_aliases/unique_node_names': 'Each node can only have one alias',
    'spreadsheet/filter/config': 'Gridsuite filters',
    'spreadsheet/remove_spreadsheet_confirmation':
        'Are you sure you want to remove the spreadsheet "{spreadsheetName}"?',
    'spreadsheet/remove_spreadsheet_error': 'Error while removing spreadsheet',
    'spreadsheet/reorder_columns/error': 'Error while reordering columns',
    'spreadsheet/reorder_tabs_error': 'Error while reordering tabs',
    'spreadsheet/rename/label': 'Rename',
    'spreadsheet/delete/label': 'Delete',
    'spreadsheet/rename_spreadsheet_error': 'Error while renaming spreadsheet',
    'spreadsheet/rename_dialog_title': 'Rename spreadsheet',
    'spreadsheet/spreadsheet_name_le_60': 'Spreadsheet name must be at most 60 characters',

    // calculations
    'spreadsheet/calculation/sum': 'Sum',
    'spreadsheet/calculation/average': 'Average',
    'spreadsheet/calculation/min': 'Minimum',
    'spreadsheet/calculation/max': 'Maximum',
    'spreadsheet/calculation/sum_abbrev': 'Sum',
    'spreadsheet/calculation/average_abbrev': 'Avg',
    'spreadsheet/calculation/min_abbrev': 'Min',
    'spreadsheet/calculation/max_abbrev': 'Max',

    // Column types
    TEXT: 'Text',
    NUMBER: 'Number',
    BOOLEAN: 'Boolean',
    ENUM: 'Enum',
};

export default spreadsheetEn;
