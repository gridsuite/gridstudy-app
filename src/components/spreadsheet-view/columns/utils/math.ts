/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { all, create, EvalFunction, parse } from 'mathjs';
import { unitToKiloUnit, unitToMicroUnit } from '@gridsuite/commons-ui';

const instance = create(all);

// Custom error class for MathJS validation errors
export class MathJsValidationError extends Error {
    constructor(public error: string) {
        super(error);
        this.name = 'MathJsValidationError';
    }
}

// Solve the problem of numeric index for Record (RatioTapChanger and PhaseTapChanger)
function transformExpression(expr: string): string {
    const regex = /((?:phase|ratio)TapChanger)\.steps\[([^\]]*)\]/g;
    return expr.replaceAll(regex, `$1.steps[string($2)]`);
}

const originalParse = instance.parse;

const normalizeFormula = (expr: string): string => transformExpression(expr.replaceAll('\\', '\\\\'));

// runs nothing ; the instance below is what formulas are evaluated against
export const parseFormula = (expr: string) => parse(normalizeFormula(expr));

// Compile once per distinct formula string. AG Grid runs the value getter for every row of the
// table on each filter/sort pass, and mathjs re-parses the expression on every evaluate() call
type CompiledFormula = { compiled: EvalFunction } | { error: unknown };
const compiledFormulaCache = new Map<string, CompiledFormula>();

const getCompiledFormula = (expr: string) => {
    let entry = compiledFormulaCache.get(expr);
    if (!entry) {
        try {
            const ast = originalParse(normalizeFormula(expr));
            entry = { compiled: ast.compile() };
        } catch (error) {
            // Cache parse failures too: a syntactically broken formula would otherwise
            // pay the full parse cost again on every cell of every pass
            entry = { error };
        }
        compiledFormulaCache.set(expr, entry);
    }
    if ('error' in entry) {
        throw entry.error;
    }
    return entry;
};

export const limitedEvaluate = (expr: string, scope?: object) => {
    let result;
    const entry = getCompiledFormula(expr);
    result = entry.compiled.evaluate(scope);
    if (typeof result === 'function') {
        throw new MathJsValidationError('spreadsheet/formula/function-reference/disabled');
    }
    return result;
};

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
        unequal: function (a: any, b: any) {
            // != instead of !== to be able to compare strings to numbers
            return a !== b;
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
