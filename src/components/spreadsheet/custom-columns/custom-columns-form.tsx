/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../components/utils/yup-config';

export const TAB_CUSTOM_COLUMN = 'TAB_CUSTOM_COLUMN';
export const COLUMN_NAME = 'name';
export const FORMULA = 'formula';

export const initialCustomColumnForm: CustomColumnForm = {
    [TAB_CUSTOM_COLUMN]: [
        {
            [COLUMN_NAME]: '',
            [FORMULA]: '',
        },
    ],
};

export const customColumnFormSchema = yup.object().shape({
    [TAB_CUSTOM_COLUMN]: yup
        .array()
        .of(
            yup.object().shape({
                [COLUMN_NAME]: yup
                    .string()
                    .required()
                    .matches(/^[^\s$]+$/, 'Column name must not contain spaces or $ symbols'),
                [FORMULA]: yup.string().required(),
            })
        )
        .min(1, 'The array must have at least one item'),
});

export type CustomColumnForm = yup.InferType<typeof customColumnFormSchema>;
