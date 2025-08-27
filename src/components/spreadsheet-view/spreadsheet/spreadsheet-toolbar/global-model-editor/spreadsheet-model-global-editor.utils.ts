/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../utils/yup-config';
import { areArrayElementsUnique } from '../../../../utils/utils';
import { COLUMN_TYPES } from '../../../../custom-aggrid/custom-aggrid-header.type';

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
                    .matches(/^[a-zA-Z_]\w*$/, 'spreadsheet/custom_column/error/id_not_conform'),
                [COLUMN_NAME]: yup.string().required().max(60, 'spreadsheet/custom_column/error/name_le_60'),
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
        .required()
        .test('uniqueColumnsIds', 'spreadsheet/custom_column/column_id_already_exist', (array) => {
            const columnsIdsArray = array.map((l) => l[COLUMN_ID]).filter((value) => value);
            return areArrayElementsUnique(columnsIdsArray);
        })
        .test('uniqueColumnsNames', 'spreadsheet/custom_column/column_name_already_exist', (array) => {
            const columnsNamesArray = array.map((l) => l[COLUMN_NAME]).filter((value) => value);
            return areArrayElementsUnique(columnsNamesArray);
        }),
});

export type columnsModelForm = yup.InferType<typeof columnsModelFormSchema>;
