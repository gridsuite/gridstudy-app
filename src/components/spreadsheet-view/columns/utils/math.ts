/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { all, create } from 'mathjs';
import { unitToKiloUnit, unitToMicroUnit } from '@gridsuite/commons-ui';
import { formatValidationResult } from './formula-validator';

const instance = create(all);

export const limitedEvaluate = instance.evaluate;

instance.import(
    {
        import: () => formatValidationResult(false, 'spreadsheet/formula/import/disabled'),
        createUnit: () => formatValidationResult(false, 'spreadsheet/formula/createUnit/disabled'),
        evaluate: () => formatValidationResult(false, 'spreadsheet/formula/evaluate/disabled'),
        parse: () => formatValidationResult(false, 'spreadsheet/formula/parse/disabled'),
        simplify: () => formatValidationResult(false, 'spreadsheet/formula/simplify/disabled'),
        derivative: () => formatValidationResult(false, 'spreadsheet/formula/derivative/disabled'),
        compile: () => formatValidationResult(false, 'spreadsheet/formula/compile/disabled'),
        help: () => formatValidationResult(false, 'spreadsheet/formula/help/disabled'),
        parser: () => formatValidationResult(false, 'spreadsheet/formula/parser/disabled'),
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
            return formatValidationResult(false, 'spreadsheet/formula/length/error');
        },
        unitToKiloUnit,
        unitToMicroUnit,
    },
    { override: true }
);
