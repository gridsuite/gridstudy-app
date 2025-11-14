/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { MAX_FORMULA_CHARACTERS } from '../../constants';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function isValidationResult(value: unknown): value is ValidationResult {
    return (
        typeof value === 'object' && value !== null && value.hasOwnProperty('isValid') && value.hasOwnProperty('error')
    );
}

export function isValidationError(value: unknown): value is ValidationResult {
    return isValidationResult(value) && !value.isValid;
}

export const formatValidationResult = (isValid: boolean, messageId?: string): ValidationResult => {
    return { isValid: isValid, error: messageId };
};

export const validateFormulaResult = (value: any, type: COLUMN_TYPES): ValidationResult => {
    if (isValidationResult(value)) {
        return value;
    }

    switch (type) {
        case COLUMN_TYPES.NUMBER:
            return formatValidationResult(
                (typeof value === 'number' && !isNaN(value)) || (typeof value !== 'boolean' && !isNaN(Number(value))),
                'spreadsheet/formula/type/number'
            );
        case COLUMN_TYPES.BOOLEAN:
            return formatValidationResult(typeof value === 'boolean', 'spreadsheet/formula/type/boolean');
        case COLUMN_TYPES.ENUM:
            return formatValidationResult(
                typeof value === 'string' || typeof value === 'number',
                'spreadsheet/formula/type/enum'
            );
        case COLUMN_TYPES.TEXT:
            return formatValidationResult(true); // Text accepts any type
        default:
            return formatValidationResult(false, 'spreadsheet/formula/type/unknown');
    }
};

export const isFormulaContentSizeOk = (val: string) => {
    return val?.length <= MAX_FORMULA_CHARACTERS;
};
