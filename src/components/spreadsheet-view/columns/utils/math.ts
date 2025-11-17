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

instance.import(
    {
        import: () => ({
            error: 'spreadsheet/formula/import/disabled',
        }),
        createUnit: () => ({
            error: 'spreadsheet/formula/createUnit/disabled',
        }),
        evaluate: () => ({
            error: 'spreadsheet/formula/evaluate/disabled',
        }),
        parse: () => ({
            error: 'spreadsheet/formula/parse/disabled',
        }),
        simplify: () => ({
            error: 'spreadsheet/formula/simplify/disabled',
        }),
        derivative: () => ({
            error: 'spreadsheet/formula/derivative/disabled',
        }),
        compile: () => ({
            error: 'spreadsheet/formula/compile/disabled',
        }),
        help: () => ({
            error: 'spreadsheet/formula/help/disabled',
        }),
        parser: () => ({
            error: 'spreadsheet/formula/parser/disabled',
        }),
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
            return { error: 'spreadsheet/formula/length/error' };
        },
        unitToKiloUnit,
        unitToMicroUnit,
    },
    { override: true }
);
