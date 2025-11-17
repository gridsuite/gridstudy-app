/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { MAX_FORMULA_CHARACTERS } from '../../constants';
import { type CustomAggridValue } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';

export interface ValidationError {
    error: string;
}

export function isValidationError(value: unknown): value is ValidationError {
    return typeof value === 'object' && value !== null && value.hasOwnProperty('error');
}

export const validateFormulaResult = (value: CustomAggridValue, type: COLUMN_TYPES): CustomAggridValue => {
    switch (type) {
        case COLUMN_TYPES.NUMBER:
            return (typeof value === 'number' && !isNaN(value)) || (typeof value !== 'boolean' && !isNaN(Number(value)))
                ? value
                : { error: 'spreadsheet/formula/type/number' };
        case COLUMN_TYPES.BOOLEAN:
            return typeof value === 'boolean'
                ? value
                : {
                      error: 'spreadsheet/formula/type/boolean',
                  };
        case COLUMN_TYPES.ENUM:
            return typeof value === 'string' || typeof value === 'number'
                ? value
                : { error: 'spreadsheet/formula/type/enum' };
        case COLUMN_TYPES.TEXT:
            return value; // Text accepts any type
        default:
            return { error: 'spreadsheet/formula/type/unknown' };
    }
};

export const isFormulaContentSizeOk = (val: string) => {
    return val?.length <= MAX_FORMULA_CHARACTERS;
};
