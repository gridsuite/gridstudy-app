/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { COLUMN_TYPES } from '@gridsuite/commons-ui';
import yup from '../../utils/yup-config';

export const COLUMN_ID = 'id';
export const COLUMN_NAME = 'name';
export const COLUMN_TYPE = 'type';
export const PRECISION = 'precision';
export const FORMULA = 'formula';
export const COLUMN_DEPENDENCIES = 'dependencies';

export const initialColumnCreationForm: ColumnCreationForm = {
    [COLUMN_ID]: '',
    [COLUMN_NAME]: '',
    [COLUMN_TYPE]: COLUMN_TYPES.TEXT,
    [PRECISION]: 0,
    [FORMULA]: '',
    [COLUMN_DEPENDENCIES]: [],
};

export const columnCreationFormSchema = yup.object().shape({
    [COLUMN_ID]: yup
        .string()
        .required()
        .max(60, 'spreadsheet/custom_column/error/id_le_60')
        .matches(/^[a-zA-Z_]\w*$/, 'spreadsheet/custom_column/error/id_not_conform'),
    [COLUMN_NAME]: yup.string().required().max(60, 'spreadsheet/custom_column/error/name_le_60'),
    [COLUMN_TYPE]: yup.mixed<COLUMN_TYPES>().oneOf(Object.values(COLUMN_TYPES)).required(),
    [PRECISION]: yup
        .number()
        .integer()
        .when(COLUMN_TYPE, ([type]) => {
            return type === COLUMN_TYPES.NUMBER ? yup.number().integer().required() : yup.number().nullable().integer();
        }),
    [FORMULA]: yup.string().required(),
    [COLUMN_DEPENDENCIES]: yup.array().of(yup.string().required()).required(),
});

export type ColumnCreationForm = yup.InferType<typeof columnCreationFormSchema>;
