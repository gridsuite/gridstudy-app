/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { all, create, MathJsInstance } from 'mathjs';
import { Formula } from './Formula';

export default class FormulaMathJs implements Formula /*<Record<string, unknown> | Map<string, unknown>>*/ {
    private math: MathJsInstance;
    private mathEvaluate: MathJsInstance['evaluate'];

    constructor() {
        // https://mathjs.org/docs/core/configuration.html
        this.math = create(all, {
            precision: 1,
            number: 'BigNumber',
            // numberFallback: 'number',
            // The maximum number of significant digits for BigNumbers. This setting only applies to BigNumbers, not to numbers. Default value is 64, only applicable for BigNumbers.
            //TODO precision: GRIDSUITE_DEFAULT_PRECISION,
            // matrix: 'Matrix',
            //TODO predictable: true,
            //epsilon: Deprecated: Use relTol and absTol instead
            // The minimum absolute difference used to test equality between two compared values. This value is used by all relational functions. Default value is 1e-15.
            //TODO absTol: 000,
            // The minimum relative difference used to test equality between two compared values. This value is used by all relational functions. Default value is 1e-12.
            //TODO relTol: 000,
        });
        // this.math.import(numbers, { wrap: true, silent: true });
        // this.math.import(numeric, { wrap: true, silent: true }); // Vite warning: "node_modules/numeric/numeric-x.x.x.js: Use of eval in "node_modules/numeric/numeric-x.x.x.js" is strongly discouraged as it poses security risks and may cause issues with minification."
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        // mathjsSimpleIntegral; //this.math.import(mathjsSimpleIntegral);

        //TODO https://github.com/josdejong/mathjs/blob/HEAD/types/EXPLANATION.md
        //https://github.com/josdejong/typed-function

        //TODO https://mathjs.org/docs/core/extension.html
        //add custom functions (other tabs, node, studies...
        //add custom types

        /* Expression parser security (https://mathjs.org/examples/advanced/more_secure_eval.js.html & https://mathjs.org/docs/expressions/security.html)
         * Executing arbitrary expressions like enabled by the expression parser of mathjs involves a risk in general. When you're using mathjs to let users
         * execute arbitrary expressions, it's good to take a moment to think about possible security and stability implications, especially when running the
         * code server side.
         * There is a small number of functions which yield the biggest security risk in the expression parser of math.js:
         *   - `import` and `createUnit` which alter the built-in functionality and allow overriding existing functions and units.
         *   - `evaluate`, `parse`, `simplify`, and `derivative` which parse arbitrary input into a manipulable expression tree.
         */
        this.mathEvaluate = this.math.evaluate;
        this.math.import(
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
            },
            { override: true }
        );
    }

    calc(formula: string, scope: Record<string, unknown> | Map<string, unknown>): unknown {
        console.log(scope);
        try {
            return this.mathEvaluate(formula, scope);
        } catch (e) {
            return '#ERR'; //TODO have a cellRender custom in aggrid to better handling, and have debugger to help
        }
    }

    // https://mathjs.org/examples/advanced/custom_scope_objects.js.html
    public calcColumnValue(
        formula: string,
        lineData: Record<string, unknown>,
        currentNode: unknown, //TODO !! where is the current node data?
        colGetter: (field: string) => unknown
    ) {
        const scope = new Map<string, unknown>();
        scope.set('column', colGetter);
        scope.set('$$', /*currentNode*/ null);
        //TODO inject lazied proxy for all nodes of the tree, named '$'+node_name
        for (const field in lineData) {
            scope.set(`var_${field}`, lineData[field]);
            //TODO "@" isn't supported in expressions? or is it already used by a function?
        }
        //TODO look how to inject others column
        // idea: eval all formula in form of "f1 = ..." to store in scope?
        // idea: store all formula in function in scope?
        //TODO create a function to load another study following this example: https://mathjs.org/examples/advanced/custom_argument_parsing.js.html
        return this.calc(formula, scope);
    }

    // https://mathjs.org/docs/core/serialization.html
    formulaSerialize(x: unknown): string {
        return JSON.stringify(x, this.math.replacer);
    }

    // https://mathjs.org/docs/core/serialization.html
    formulaDeserialize(json: string): unknown {
        return JSON.parse(json, this.math.reviver);
    }

    formulaToString(x: unknown): string {
        const precision = 14; //GRIDSUITE_DEFAULT_PRECISION
        return this.math.format(x, precision);
    }

    destroy(): void {}

    example() {
        const print = (value: unknown) => console.log(this.formulaToString(value));
        print(this.math.round(this.math.e, 3)); // 2.718
        print(this.math.atan2(3, -3) / this.math.pi); // 0.75
        print(this.math.log(10000, 10)); // 4
        print(this.math.sqrt(-4)); // 2i
        print(
            this.math.pow(
                [
                    [-1, 2],
                    [3, 1],
                ],
                2
            )
        ); // [[7, 0], [0, 7]]
        print(this.math.derivative('x^2 + x', 'x')); // 2 * x + 1
        // expressions
        print(this.math.evaluate('12 / (2.3 + 0.7)')); // 4
        print(this.math.evaluate('12.7 cm to inch')); // 5 inch
        print(this.math.evaluate('9 / 3 + 2i')); // 3 + 2i
        print(this.math.evaluate('det([-1, 2; 3, 1])')); // -7
        // chained operations
        print(this.math.chain(3).add(4).multiply(2).done()); // 14

        console.log(this.math.evaluate('sqrt(16)')); // Ok, 4
        console.log(this.math.evaluate('parse("2+3")')); // Error: Function parse is disabled

        // Operators `add` and `divide` do have support for Fractions, so the result will simply be a Fraction (default behavior of math.js).
        const ans1 = this.math.evaluate('1/3 + 1/4');
        console.log(this.math.typeOf(ans1), this.math.format(ans1)); // outputs "Fraction 7/12"
        // Function sqrt doesn't have Fraction support, will now fall back to BigNumber instead of number.
        const ans2 = this.math.evaluate('sqrt(4)');
        console.log(this.math.typeOf(ans2), this.math.format(ans2)); // outputs "BigNumber 2"
        // We can now do operations with mixed Fractions and BigNumbers
        const ans3 = this.math.add(this.math.fraction(2, 5), this.math.bignumber(3));
        console.log(this.math.typeOf(ans3), this.math.format(ans3)); // outputs "BigNumber 3.4"
    }
}

/* https://mathjs.org/examples/advanced/convert_fraction_to_bignumber.js.html
 * When `Fraction` is configured, one may want to fallback to `BigNumber` instead of `number`. Also, one may want to be able to mix `Fraction` and
 * `BigNumber` in operations like summing them up. This can be achieved by adding an extra conversion to the list of conversions as demonstrated in
 * this example.
 */
// Create an empty math.js instance, with only typed (every instance contains `import` and `config` also out of the box)
//TODO look in https://github.com/josdejong/typed-function/  node_modules/mathjs/types/EXPLANATION.md
//const math = create({
//    typedDependencies,
//});
//const allExceptLoaded = Object.keys(all)
//    .map((key) => all[key])
//    .filter((factory) => math[factory.fn] === undefined);
//math.config({ number: 'Fraction' }); // Configure to use fractions by default
///* Add a conversion from Faction -> BigNumber
// * This conversion will to override the existing conversion from Fraction to BigNumber.
// * It must be added *after* the default conversions are loaded and *before* the actual functions are imported into math.js.
// */
//math.typed.addConversion(
//    {
//        from: 'Fraction',
//        to: 'BigNumber',
//        convert: (fraction: Fraction) => math.bignumber(fraction.n).div(fraction.d),
//    },
//    { override: true }
//);
//math.import(allExceptLoaded); // Import all data types, functions, constants, the expression parser, etc.
