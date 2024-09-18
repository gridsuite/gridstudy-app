/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../components/utils/yup-config';

export const TAB_CUSTOM_COLUMN = 'TAB_CUSTOM_COLUMN';
export const FORMULA_NAME = 'FORMULA_NAME';
export const COLUMN_NAME = 'COLUMN_NAME';
export const FORMULA = 'FORMULA';

export const initialCustomColumnForm: CustomColumnForm = {
    [FORMULA_NAME]: '',
    [TAB_CUSTOM_COLUMN]: [
        {
            [COLUMN_NAME]: '',
            [FORMULA]: '',
        },
    ],
};

export const customColumnFormSchema = yup.object().shape({
    [FORMULA_NAME]: yup.string().required(),
    [TAB_CUSTOM_COLUMN]: yup.array().of(
        yup.object().shape({
            [COLUMN_NAME]: yup.string().required(),
            [FORMULA]: yup.string().required(),
        })
    ),
});

export type CustomColumnForm = yup.InferType<typeof customColumnFormSchema>;
