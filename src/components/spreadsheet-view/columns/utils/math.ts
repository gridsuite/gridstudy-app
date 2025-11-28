/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { all, create } from 'mathjs';
import { unitToKiloUnit, unitToMicroUnit } from '@gridsuite/commons-ui';

const instance = create(all);

export const limitedEvaluate = instance.evaluate;

// Custom error class for MathJS validation errors
export class MathJsValidationError extends Error {
    constructor(public error: string) {
        super(error);
        this.name = 'MathJsValidationError';
    }
}

instance.import(
    {
        import: () => {
            throw new MathJsValidationError('spreadsheet/formula/import/disabled');
        },
        createUnit: () => {
            throw new MathJsValidationError('spreadsheet/formula/createUnit/disabled');
        },
        evaluate: () => {
            throw new MathJsValidationError('spreadsheet/formula/evaluate/disabled');
        },
        parse: () => {
            throw new MathJsValidationError('spreadsheet/formula/parse/disabled');
        },
        simplify: () => {
            throw new MathJsValidationError('spreadsheet/formula/simplify/disabled');
        },
        derivative: () => {
            throw new MathJsValidationError('spreadsheet/formula/derivative/disabled');
        },
        compile: () => {
            throw new MathJsValidationError('spreadsheet/formula/compile/disabled');
        },
        help: () => {
            throw new MathJsValidationError('spreadsheet/formula/help/disabled');
        },
        parser: () => {
            throw new MathJsValidationError('spreadsheet/formula/parser/disabled');
        },
        equal: function (a: any, b: any) {
            // == instead of === to be able to compare strings to numbers
            return a === b;
        },
        match: function (expr: string, variable: string, flags: string = '') {
            return RegExp(expr, flags).test(variable);
        },
        length: function (obj: unknown) {
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                return Object.keys(obj).length;
            } else if (Array.isArray(obj)) {
                return obj.length;
            }
            throw new MathJsValidationError('spreadsheet/formula/length/error');
        },
        unitToKiloUnit,
        unitToMicroUnit,
    },
    { override: true }
);
