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
        import: function () {
            throw new Error('Function import is disabled');
        },
        createUnit: function () {
            throw new Error('Function createUnit is disabled');
        },
        evaluate: function () {
            throw new Error('Function evaluate is disabled');
        },
        parse: function () {
            throw new Error('Function parse is disabled');
        },
        simplify: function () {
            throw new Error('Function simplify is disabled');
        },
        derivative: function () {
            throw new Error('Function derivative is disabled');
        },
        equal: function (a: any, b: any) {
            // == instead of === to be able to compare strings to numbers
            return a === b;
        },
        match: function (expr: string, variable: string, flags: string = '') {
            return RegExp(expr, flags).test(variable);
        },
        unitToKiloUnit,
        unitToMicroUnit,
    },
    { override: true }
);
