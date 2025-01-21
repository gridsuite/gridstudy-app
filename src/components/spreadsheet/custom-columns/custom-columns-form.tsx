/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../components/utils/yup-config';

const COLUMN_ID = 'id';
export const COLUMN_NAME = 'name';
export const FORMULA = 'formula';

export const initialCustomColumnForm: CustomColumnForm = {
    [COLUMN_ID]: '',
    [COLUMN_NAME]: '',
    [FORMULA]: '',
};

export const customColumnFormSchema = yup.object().shape({
    [COLUMN_ID]: yup.string(),
    [COLUMN_NAME]: yup.string().required().max(60, 'spreadsheet/custom_column/error/name_exceeds_length'),
    [FORMULA]: yup.string().required(),
});

export type CustomColumnForm = yup.InferType<typeof customColumnFormSchema>;
