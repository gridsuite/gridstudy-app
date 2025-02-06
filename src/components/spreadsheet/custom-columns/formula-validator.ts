/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateFormulaResult = (value: any, type: COLUMN_TYPES): ValidationResult => {
    switch (type) {
        case COLUMN_TYPES.NUMBER:
            return {
                isValid: typeof value === 'number' || (typeof value !== 'boolean' && !isNaN(Number(value))),
                error: 'Formula must evaluate to a number',
            };
        case COLUMN_TYPES.BOOLEAN:
            return {
                isValid: typeof value === 'boolean',
                error: 'Formula must evaluate to a boolean',
            };
        case COLUMN_TYPES.ENUM:
            return {
                isValid: typeof value === 'string',
                error: 'Formula must evaluate to a string',
            };
        case COLUMN_TYPES.TEXT:
            return { isValid: true }; // Text accepts any type
        default:
            return { isValid: false, error: 'Unknown column type' };
    }
};
