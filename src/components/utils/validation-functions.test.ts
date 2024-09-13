/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    validateValueIsANumber,
    exportedForTesting,
    validateValueIsLessThanOrEqualTo,
    validateValueIsLessThan,
    validateField,
    checkReactiveCapabilityCurve,
} from './validation-functions';

const { toNumber, isBlankOrEmpty } = exportedForTesting;

const error = jest.spyOn(console, 'error').mockImplementation(() => {});
const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('validation-functions', () => {
    beforeEach(() => {
        error.mockClear();
        warn.mockClear();
    });

    describe('isBlankOrEmpty', () => {
        it.each`
            input        | expected
            ${'hello'}   | ${false}
            ${'0'}       | ${false}
            ${0}         | ${false}
            ${false}     | ${false}
            ${true}      | ${false}
            ${' '}       | ${true}
            ${null}      | ${true}
            ${undefined} | ${true}
        `('expect : isBlankOrEmpty($input) \t to equals : $expected ', ({ input, expected }) => {
            expect(isBlankOrEmpty(input)).toBe(expected);
        });
    });

    describe('toNumber', () => {
        it.each`
            input              | expected   | logs
            ${''}              | ${NaN}     | ${true}
            ${undefined}       | ${NaN}     | ${true}
            ${null}            | ${NaN}     | ${true}
            ${false}           | ${NaN}     | ${true}
            ${true}            | ${NaN}     | ${true}
            ${NaN}             | ${NaN}     | ${false}
            ${'hello'}         | ${NaN}     | ${false}
            ${{ 0: 1 }}        | ${NaN}     | ${true}
            ${[10]}            | ${NaN}     | ${true}
            ${'  0020,5000  '} | ${20.5}    | ${false}
            ${0}               | ${0}       | ${false}
            ${',0'}            | ${0}       | ${false}
            ${'0.99999'}       | ${0.99999} | ${false}
        `('toNumber($input) \t should equals ($expected)', ({ input, expected, logs }) => {
            expect(toNumber(input)).toBe(expected);
            if (logs) {
                expect(error).toHaveBeenCalled();
            } else {
                expect(error).not.toHaveBeenCalled();
            }
        });

        it.each([-0, 0.0, -0.0, '-0', '0,0', ',0', '-,000', '-.000'])(
            'compare toNumber(%s) and toNumber(0) \t should be true',
            (input) => {
                expect(toNumber(input) === toNumber(0)).toBe(true);
            }
        );
    });

    describe('validateValueIsANumber', () => {
        it.each`
            input           | expected
            ${10}           | ${true}
            ${0}            | ${true}
            ${'0'}          | ${true}
            ${'-0'}         | ${true}
            ${'-10'}        | ${true}
            ${'-.0'}        | ${true}
            ${'-,0'}        | ${true}
            ${'.0'}         | ${true}
            ${'0.510'}      | ${true}
            ${',510'}       | ${true}
            ${'-,510'}      | ${true}
            ${'  -,510   '} | ${true}
            ${55.51}        | ${true}
            ${-55.51}       | ${true}
            ${'-55,51'}     | ${true}
            ${'-55,'}       | ${true}
            ${'-55.'}       | ${true}
            ${null}         | ${false}
            ${NaN}          | ${false}
            ${undefined}    | ${false}
            ${false}        | ${false}
            ${'hello'}      | ${false}
            ${'15.564,54'}  | ${false}
            ${true}         | ${false}
            ${''}           | ${false}
        `('validateValueIsANumber($input) \t should be $expected', ({ input, expected }) => {
            expect(validateValueIsANumber(input)).toBe(expected);
        });
    });
    describe('validateValueIsLessThanOrEqualTo', () => {
        it.each`
            source       | target       | expected
            ${0}         | ${0}         | ${true}
            ${0}         | ${1}         | ${true}
            ${1.0}       | ${1}         | ${true}
            ${0.9}       | ${0.91}      | ${true}
            ${-0.91}     | ${-0.9}      | ${true}
            ${'90,54'}   | ${154}       | ${true}
            ${'-90,54'}  | ${-90.54}    | ${true}
            ${false}     | ${true}      | ${false}
            ${false}     | ${false}     | ${false}
            ${undefined} | ${undefined} | ${false}
            ${true}      | ${true}      | ${false}
            ${1.00001}   | ${1}         | ${false}
            ${0.00001}   | ${-1}        | ${false}
            ${'1.00001'} | ${'1'}       | ${false}
            ${'.00001'}  | ${'-1'}      | ${false}
            ${0}         | ${false}     | ${false}
            ${0}         | ${true}      | ${false}
            ${0}         | ${NaN}       | ${false}
            ${NaN}       | ${NaN}       | ${false}
            ${NaN}       | ${undefined} | ${false}
            ${'a'}       | ${9999}      | ${false}
        `(
            'validateValueIsLessThanOrEqualTo($source, $target) \t should be $expected',
            ({ source, target, expected }) => {
                expect(validateValueIsLessThanOrEqualTo(source, target)).toBe(expected);
            }
        );
    });

    describe('validateValueIsLessThan', () => {
        it.each`
            source       | target       | expected
            ${0}         | ${0}         | ${false}
            ${0}         | ${1}         | ${true}
            ${1.0}       | ${1}         | ${false}
            ${0.9}       | ${0.91}      | ${true}
            ${-0.91}     | ${-0.9}      | ${true}
            ${'90,54'}   | ${154}       | ${true}
            ${'-90,54'}  | ${-90.54}    | ${false}
            ${false}     | ${true}      | ${false}
            ${false}     | ${false}     | ${false}
            ${undefined} | ${undefined} | ${false}
            ${true}      | ${true}      | ${false}
            ${1.00001}   | ${1}         | ${false}
            ${0.00001}   | ${-1}        | ${false}
            ${'1.00001'} | ${'1'}       | ${false}
            ${'.00001'}  | ${'-1'}      | ${false}
            ${0}         | ${false}     | ${false}
            ${0}         | ${true}      | ${false}
            ${0}         | ${NaN}       | ${false}
            ${NaN}       | ${NaN}       | ${false}
            ${NaN}       | ${undefined} | ${false}
            ${'a'}       | ${9999}      | ${false}
            ${'-0'}      | ${'0'}       | ${false}
            ${'.0'}      | ${'0'}       | ${false}
            ${',0'}      | ${'0'}       | ${false}
            ${'-,0'}     | ${'0'}       | ${false}
            ${0.0}       | ${0}         | ${false}
        `('validateValueIsLessThan($source, $target) \t should be $expected', ({ source, target, expected }) => {
            expect(validateValueIsLessThan(source, target)).toBe(expected);
        });
    });

    describe('validateField.isFieldRequired', () => {
        it.each`
            value        | options                                            | expected
            ${500}       | ${{ isFieldRequired: true }}                       | ${false}
            ${0}         | ${{ isFieldRequired: true, isFieldNumeric: true }} | ${false}
            ${'hello'}   | ${{ isFieldRequired: true }}                       | ${false}
            ${''}        | ${{ isFieldRequired: true }}                       | ${true}
            ${' '}       | ${{ isFieldRequired: true }}                       | ${true}
            ${null}      | ${{ isFieldRequired: true }}                       | ${true}
            ${undefined} | ${{ isFieldRequired: true }}                       | ${true}
        `('validateField($value, $options) \t should be $expected', ({ value, options, expected }) => {
            expect(validateField(value, options).error).toBe(expected);
        });
    });
    describe('validateField.isFieldNumeric', () => {
        it.each`
            value        | options                                            | expected
            ${500}       | ${{ isFieldNumeric: true }}                        | ${false}
            ${0}         | ${{ isFieldNumeric: true }}                        | ${false}
            ${-0.0}      | ${{ isFieldNumeric: true }}                        | ${false}
            ${'hello'}   | ${{ isFieldNumeric: true }}                        | ${true}
            ${''}        | ${{ isFieldNumeric: true }}                        | ${false}
            ${''}        | ${{ isFieldRequired: true, isFieldNumeric: true }} | ${true}
            ${' '}       | ${{ isFieldRequired: true, isFieldNumeric: true }} | ${true}
            ${null}      | ${{ isFieldRequired: true, isFieldNumeric: true }} | ${true}
            ${undefined} | ${{ isFieldRequired: true, isFieldNumeric: true }} | ${true}
        `('validateField($value, $options) \t should be $expected', ({ value, options, expected }) => {
            expect(validateField(value, options).error).toBe(expected);
        });
    });
    describe('validateField.valueGreaterThanOrEqualTo', () => {
        it.each`
            value        | options                                                     | expected
            ${500}       | ${{ valueGreaterThanOrEqualTo: 10 }}                        | ${false}
            ${500}       | ${{ valueGreaterThanOrEqualTo: 0 }}                         | ${false}
            ${0}         | ${{ valueGreaterThanOrEqualTo: 0 }}                         | ${false}
            ${0}         | ${{ valueGreaterThanOrEqualTo: 10 }}                        | ${true}
            ${-500}      | ${{ valueGreaterThanOrEqualTo: 10 }}                        | ${true}
            ${-500}      | ${{ valueGreaterThanOrEqualTo: 0 }}                         | ${true}
            ${0}         | ${{ valueGreaterThanOrEqualTo: -10 }}                       | ${false}
            ${''}        | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${''}        | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
            ${' '}       | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${' '}       | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
            ${null}      | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${null}      | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
            ${undefined} | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${undefined} | ${{ valueGreaterThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
        `('validateField($value, $options) \t should be $expected', ({ value, options, expected }) => {
            expect(validateField(value, options).error).toBe(expected);
        });
    });
    describe('validateField.valueLessThanOrEqualTo', () => {
        it.each`
            value        | options                                                  | expected
            ${-600}      | ${{ valueLessThanOrEqualTo: 10 }}                        | ${false}
            ${-600}      | ${{ valueLessThanOrEqualTo: 0 }}                         | ${false}
            ${0}         | ${{ valueLessThanOrEqualTo: -10 }}                       | ${true}
            ${600}       | ${{ valueLessThanOrEqualTo: 10 }}                        | ${true}
            ${600}       | ${{ valueLessThanOrEqualTo: 0 }}                         | ${true}
            ${0}         | ${{ valueLessThanOrEqualTo: 0 }}                         | ${false}
            ${0}         | ${{ valueLessThanOrEqualTo: 10 }}                        | ${false}
            ${''}        | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${''}        | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
            ${' '}       | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${' '}       | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
            ${null}      | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${null}      | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
            ${undefined} | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: false }} | ${false}
            ${undefined} | ${{ valueLessThanOrEqualTo: 2, isFieldRequired: true }}  | ${true}
        `('validateField($value, $options) \t should be $expected', ({ value, options, expected }) => {
            expect(validateField(value, options).error).toBe(expected);
        });
    });
    describe('validateField.valueLessThan', () => {
        it.each`
            value        | options                                         | expected
            ${600}       | ${{ valueLessThan: 10 }}                        | ${true}
            ${600}       | ${{ valueLessThan: 0 }}                         | ${true}
            ${0}         | ${{ valueLessThan: 0 }}                         | ${true}
            ${0}         | ${{ valueLessThan: 10 }}                        | ${false}
            ${-600}      | ${{ valueLessThan: 10 }}                        | ${false}
            ${-600}      | ${{ valueLessThan: 0 }}                         | ${false}
            ${0}         | ${{ valueLessThan: -10 }}                       | ${true}
            ${''}        | ${{ valueLessThan: 2, isFieldRequired: false }} | ${false}
            ${''}        | ${{ valueLessThan: 2, isFieldRequired: true }}  | ${true}
            ${' '}       | ${{ valueLessThan: 2, isFieldRequired: false }} | ${false}
            ${' '}       | ${{ valueLessThan: 2, isFieldRequired: true }}  | ${true}
            ${null}      | ${{ valueLessThan: 2, isFieldRequired: false }} | ${false}
            ${null}      | ${{ valueLessThan: 2, isFieldRequired: true }}  | ${true}
            ${undefined} | ${{ valueLessThan: 2, isFieldRequired: false }} | ${false}
            ${undefined} | ${{ valueLessThan: 2, isFieldRequired: true }}  | ${true}
        `('validateField($value, $options) \t should be $expected', ({ value, options, expected }) => {
            expect(validateField(value, options).error).toBe(expected);
        });
    });
    describe('validateField.valueGreaterThan', () => {
        it.each`
            value        | options                                            | expected
            ${600}       | ${{ valueGreaterThan: 10 }}                        | ${false}
            ${600}       | ${{ valueGreaterThan: 0 }}                         | ${false}
            ${0}         | ${{ valueGreaterThan: 0 }}                         | ${true}
            ${0}         | ${{ valueGreaterThan: 10 }}                        | ${true}
            ${-600}      | ${{ valueGreaterThan: 10 }}                        | ${true}
            ${-600}      | ${{ valueGreaterThan: 0 }}                         | ${true}
            ${0}         | ${{ valueGreaterThan: -10 }}                       | ${false}
            ${''}        | ${{ valueGreaterThan: 2, isFieldRequired: false }} | ${false}
            ${''}        | ${{ valueGreaterThan: 2, isFieldRequired: true }}  | ${true}
            ${' '}       | ${{ valueGreaterThan: 2, isFieldRequired: false }} | ${false}
            ${' '}       | ${{ valueGreaterThan: 2, isFieldRequired: true }}  | ${true}
            ${null}      | ${{ valueGreaterThan: 2, isFieldRequired: false }} | ${false}
            ${null}      | ${{ valueGreaterThan: 2, isFieldRequired: true }}  | ${true}
            ${undefined} | ${{ valueGreaterThan: 2, isFieldRequired: false }} | ${false}
            ${undefined} | ${{ valueGreaterThan: 2, isFieldRequired: true }}  | ${true}
        `('validateField($value, $options) \t should be $expected', ({ value, options, expected }) => {
            expect(validateField(value, options).error).toBe(expected);
        });
    });

    describe('validateField.forceValidation', () => {
        it.each`
            value  | options                                         | disabled     | expected
            ${600} | ${{ valueLessThan: 10 }}                        | ${undefined} | ${true}
            ${600} | ${{ valueLessThan: 10 }}                        | ${true}      | ${false}
            ${600} | ${{ valueLessThan: 10, forceValidation: true }} | ${undefined} | ${true}
        `(
            'validateField($value, $options,$disabled) \t should be $expected',
            ({ value, options, disabled, expected }) => {
                expect(validateField(value, options, disabled).error).toBe(expected);
            }
        );
    });

    describe('checkReactiveCapabilityCurve', () => {
        it.each([
            {
                data: [
                    { p: '0', minQ: '0', maxQ: '0' },
                    { p: '10', minQ: '0', maxQ: '0' },
                ],
                nbError: 0,
                title: 'Correct reactive cabability curves (case 1)',
            },
            {
                data: [
                    { p: '-10', minQ: '-5', maxQ: '-2' },
                    { p: '10', minQ: '1', maxQ: '56' },
                ],
                nbError: 0,
                title: 'Correct reactive cabability curves (case 2)',
            },
            {
                data: [
                    { p: '-10', minQ: '-5', maxQ: '-2' },
                    { p: '0', minQ: '0', maxQ: '0' },
                    { p: '10', minQ: '1', maxQ: '56' },
                ],
                nbError: 0,
                title: 'Correct reactive cabability curves (case 3)',
            },
            {
                data: [
                    { p: '-10', minQ: '-5', maxQ: '-2' },
                    { p: '0', minQ: '0,8', maxQ: '1' },
                    { p: '-3', minQ: '-6.5', maxQ: '-2' },
                    { p: '10', minQ: '1', maxQ: '56' },
                ],
                nbError: 0,
                title: 'Correct reactive cabability curves (case 4)',
            },
            {
                data: [],
                nbError: 1,
                title: 'Not enough points (case 1)',
            },
            {
                data: [{ p: '0', minQ: '0', maxQ: '0' }],
                nbError: 1,
                title: 'Not enough points (case 2)',
            },
            {
                data: [
                    { p: '10', minQ: '-5', maxQ: '-2' },
                    { p: '10', minQ: '1', maxQ: '56' },
                ],
                nbError: 1,
                title: 'Not unique P values (case 1)',
            },
            {
                data: [
                    { p: '-10', minQ: '-5', maxQ: '-2' },
                    { p: '-0', minQ: '0', maxQ: '0' },
                    { p: '0', minQ: '1', maxQ: '56' },
                ],
                nbError: 1,
                title: 'Not unique P values (case 2)',
            },
            {
                data: [
                    { p: '-0', minQ: '0', maxQ: '0' },
                    { p: '0', minQ: '0', maxQ: '0' },
                ],
                nbError: 1,
                title: 'Not unique P values (case 3)',
            },
            {
                data: [
                    { p: '0', minQ: '0', maxQ: '0' },
                    { p: '0.0', minQ: '0', maxQ: '0' },
                ],
                nbError: 1,
                title: 'Not unique P values (case 4)',
            },
            {
                data: [
                    { p: ',0', minQ: '0', maxQ: '0' },
                    { p: '0', minQ: '0', maxQ: '0' },
                ],
                nbError: 1,
                title: 'Not unique P values (case 5)',
            },
            {
                data: [
                    { p: '0', minQ: '-5', maxQ: '-2' },
                    { p: '-10', minQ: '0', maxQ: '0' },
                    { p: '10', minQ: '1', maxQ: '56' },
                ],
                nbError: 1,
                title: 'Pmin and Pmax values are not in the begining and end of the array',
            },
            {
                data: [
                    { p: '-10', minQ: '-5', maxQ: '-2' },
                    { p: '260', minQ: '0', maxQ: '0' },
                    { p: '10', minQ: '1', maxQ: '56' },
                ],
                nbError: 1,
                title: 'P values between Pmin and Pmax are below Pmin or above Pmax (case 1)',
            },
            {
                data: [
                    { p: '-10', minQ: '-5', maxQ: '-2' },
                    { p: '-20', minQ: '0', maxQ: '0' },
                    { p: '10', minQ: '1', maxQ: '56' },
                ],
                nbError: 1,
                title: 'P values between Pmin and Pmax are below Pmin or above Pmax (case 2)',
            },
        ])('checkReactiveCapabilityCurve with $title should provide $nbError error(s)', ({ data, nbError }) => {
            if (nbError === 0) {
                expect(checkReactiveCapabilityCurve(data)).toHaveLength(0);
            } else {
                expect(checkReactiveCapabilityCurve(data)).not.toHaveLength(0);
            }
        });
    });
});
