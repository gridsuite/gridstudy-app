/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../components/utils/yup-config';

export const COLUMN_ID = 'id';
export const COLUMN_NAME = 'name';
export const FORMULA = 'formula';

export const initialCustomColumnForm: CustomColumnForm = {
    [COLUMN_ID]: '',
    [COLUMN_NAME]: '',
    [FORMULA]: '',
};

export const customColumnFormSchema = yup.object().shape({
    [COLUMN_ID]: yup
        .string()
        .required()
        .max(60, 'spreadsheet/custom_column/error/id_le_60')
        .matches(/^[^\s$]+$/, 'spreadsheet/custom_column/error/id_not_conform'),
    [COLUMN_NAME]: yup.string().required().max(60, 'spreadsheet/custom_column/error/name_le_60'),
    [FORMULA]: yup.string().required(),
});

export type CustomColumnForm = yup.InferType<typeof customColumnFormSchema>;
