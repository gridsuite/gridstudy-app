/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../utils/yup-config';
import { TestContext } from 'yup';
import { COLUMN_TYPES } from '../../../../../types/custom-aggrid-types';

export const COLUMNS_MODEL = 'columnsModel';
export const COLUMN_ID = 'columnId';
export const COLUMN_NAME = 'columnName';
export const COLUMN_TYPE = 'columnType';
export const COLUMN_PRECISION = 'columnPrecision';
export const COLUMN_FORMULA = 'columnFormula';
export const COLUMN_DEPENDENCIES = 'columnDependencies';
export const COLUMN_UUID = 'columnUuid';
export const COLUMN_VISIBLE = 'columnVisible';
export const SELECTED = 'selected';

export const initialColumnsModelForm: columnsModelForm = {
    [COLUMNS_MODEL]: [],
};

function checkUnicity(value: string, idCol: string, context: TestContext): boolean {
    // Skip validation if value is empty (required validation will catch it)
    if (!value) {
        return true;
    }
    // Get the entire form data to check for duplicates
    const formData = context.from?.[1]?.value;
    const columnsModel = formData?.[COLUMNS_MODEL];
    if (!columnsModel || !Array.isArray(columnsModel)) {
        return true;
    }
    const occurrences = columnsModel.filter((column) => column && column[idCol] === value).length;
    return occurrences <= 1;
}

export const columnsModelFormSchema = yup.object().shape({
    [COLUMNS_MODEL]: yup
        .array()
        .of(
            yup.object().shape({
                [COLUMN_UUID]: yup.string(),
                [COLUMN_ID]: yup
                    .string()
                    .required()
                    .max(60, 'spreadsheet/custom_column/error/id_le_60')
                    .matches(/^[a-zA-Z_]\w*$/, 'spreadsheet/custom_column/error/id_not_conform')
                    .test('unique-column-id', 'spreadsheet/custom_column/column_id_already_exist', function (value) {
                        return checkUnicity(value, COLUMN_ID, this);
                    }),
                [COLUMN_NAME]: yup
                    .string()
                    .required()
                    .max(60, 'spreadsheet/custom_column/error/name_le_60')
                    .test('uniqueColumnName', 'spreadsheet/custom_column/column_name_already_exist', function (value) {
                        return checkUnicity(value, COLUMN_NAME, this);
                    }),
                [COLUMN_TYPE]: yup.mixed<COLUMN_TYPES>().oneOf(Object.values(COLUMN_TYPES)).required(),
                [COLUMN_PRECISION]: yup
                    .number()
                    .integer()
                    .when(COLUMN_TYPE, ([type]) => {
                        return type === COLUMN_TYPES.NUMBER
                            ? yup.number().integer().required()
                            : yup.number().nullable().integer();
                    }),
                [COLUMN_FORMULA]: yup.string().required(),
                [COLUMN_DEPENDENCIES]: yup.array().of(yup.string().required()),
                [COLUMN_VISIBLE]: yup.boolean().required(),
                [SELECTED]: yup.boolean().required(),
            })
        )
        .required(),
});

export type columnsModelForm = yup.InferType<typeof columnsModelFormSchema>;
