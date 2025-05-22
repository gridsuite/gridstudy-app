/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPE_FIELD, ID, NAME } from 'components/utils/field-constants';
import * as yup from 'yup';

export const SPREADSHEET_NAME = 'spreadsheetName';
export const SPREADSHEET_MODEL = 'spreadsheetModel';
export const SPREADSHEET_COLLECTION = 'spreadsheetCollection';
export const SPREADSHEET_COLLECTION_IMPORT_MODE = 'spreadsheetCollectionMode';

export const initialEmptySpreadsheetForm: EmptySpreadsheetForm = {
    [SPREADSHEET_NAME]: '',
    [EQUIPMENT_TYPE_FIELD]: '',
};

export const initialSpreadsheetFromModelForm: SpreadsheetFromModelForm = {
    [SPREADSHEET_NAME]: '',
    [SPREADSHEET_MODEL]: [],
};

export enum SpreadsheetCollectionImportMode {
    REPLACE = 'REPLACE',
    APPEND = 'APPEND',
}

export const initialSpreadsheetCollectionForm: SpreadsheetCollectionForm = {
    [SPREADSHEET_COLLECTION]: [],
    [SPREADSHEET_COLLECTION_IMPORT_MODE]: SpreadsheetCollectionImportMode.REPLACE,
};

export const getEmptySpreadsheetFormSchema = (tablesNames: string[]) => {
    return yup.object().shape({
        [SPREADSHEET_NAME]: yup
            .string()
            .required()
            .max(60, 'spreadsheet/spreadsheet_name_le_60')
            .test('unique', 'spreadsheet/create_new_spreadsheet/spreadsheet_name_already_exists', (value) => {
                return !tablesNames.includes(value || '');
            }),
        [EQUIPMENT_TYPE_FIELD]: yup.string().required(),
    });
};

export const getSpreadsheetFromModelFormSchema = (tablesNames: string[]) => {
    return yup.object().shape({
        [SPREADSHEET_NAME]: yup
            .string()
            .required()
            .max(60, 'spreadsheet/spreadsheet_name_le_60')
            .test('unique', 'spreadsheet/create_new_spreadsheet/spreadsheet_name_already_exists', (value) => {
                return !tablesNames.includes(value || '');
            }),
        [SPREADSHEET_MODEL]: yup
            .array()
            .of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            )
            .required('spreadsheet/create_new_spreadsheet/must_select_spreadsheet_model')
            .min(1, 'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_model')
            .max(1, 'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_model'),
    });
};

export const getSpreadsheetCollectionFormSchema = () => {
    return yup.object().shape({
        [SPREADSHEET_COLLECTION_IMPORT_MODE]: yup.mixed<keyof typeof SpreadsheetCollectionImportMode>().required(),
        [SPREADSHEET_COLLECTION]: yup
            .array()
            .of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            )
            .required('spreadsheet/create_new_spreadsheet/must_select_spreadsheet_collection')
            .min(1, 'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_collection')
            .max(1, 'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_collection'),
    });
};

export type SpreadsheetFromModelForm = yup.InferType<ReturnType<typeof getSpreadsheetFromModelFormSchema>>;
export type EmptySpreadsheetForm = yup.InferType<ReturnType<typeof getEmptySpreadsheetFormSchema>>;
export type SpreadsheetCollectionForm = yup.InferType<ReturnType<typeof getSpreadsheetCollectionFormSchema>>;
