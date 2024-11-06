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

describe('validation-functions.isBlankOrEmpty', () => {
    test.each(['hello', '0', 0, false, true])('not expect %j to be blank or empty', (value) =>
        expect(isBlankOrEmpty(value)).toBeFalse()
    );
    test.each([' ', null, undefined])('expect %j to be blank or empty', (value) =>
        expect(isBlankOrEmpty(value)).toBeTrue()
    );
});

describe('validation-functions.toNumber', () => {
    describe('Invalid values must result in NaN', () =>
        test.each(['', undefined, null, false, true, NaN, 'hello', { 0: 1 }, [10]])('$(%j) === NaN', (value) =>
            expect(toNumber(value)).toBeNaN()
        ));
    test('String must be trimmed', () => expect(toNumber('  0020,5000  ')).toBe(20.5));
    test('Numbers equals themselves', () => expect(toNumber(0)).toBe(0));
    test('Decimal fraction notation is also valid', () => expect(toNumber(',0')).toBe(0));
    test("Floating number aren't rounded", () => expect(toNumber(0.99999)).not.toBe(1));
    describe('Converted values must be equal in these cases', () =>
        test.each([-0, 0.0, -0.0, '-0', '0,0', ',0', '-.000', '-,000'])('$(%j) === 0', (value) =>
            // FIXME toNumber(0) === -0 for jest, so .toBe(...) fail
            expect(toNumber(value) === toNumber(0)).toBeTrue()
        ));
});

describe('validation-functions.validateValueIsANumber', () => {
    test.each([
        10,
        0,
        '0',
        '-0',
        '-10',
        '-.0',
        '-,0',
        '.0',
        '0.510',
        ',510',
        '-,510',
        '  -,510   ',
        55.51,
        -55.51,
        '-55,51',
        '-55,',
        '-55.',
    ])('%j is valid', (value) => expect(validateValueIsANumber(value)).toBeTrue());
    test.each([null, NaN, undefined, false, 'hello', '15.564,54', true, ''])('%j is invalid', (value) =>
        expect(validateValueIsANumber(value)).toBeFalse()
    );
});

describe('validation-functions.validateValueIsLessThanOrEqualTo', () => {
    test.each([
        [0, 0],
        [0, 1],
        [1.0, 1],
        [0.9, 0.91],
        [-0.91, -0.9],
        ['90,54', 154],
        ['-90,54', -90.54],
    ])('%j ≤ %j', (a, b) => expect(validateValueIsLessThanOrEqualTo(a, b)).toBeTrue());
    test.each([
        [false, true],
        [false, false],
        [undefined, undefined],
        [true, true],
        [1.00001, 1],
        [0.00001, -1],
        ['1.00001', '1'],
        ['.00001', '-1'],
        [0, false],
        [0, true],
        [0, NaN],
        [NaN, NaN],
        [NaN, undefined],
        ['a', 9999],
    ])('%j different than %j', (a, b) => expect(validateValueIsLessThanOrEqualTo(a, b)).toBeFalse());
});

describe('validation-functions.validateValueIsLessThan', () => {
    test.each([
        [0, 1],
        [0.9, 0.91],
        [-0.91, -0.9],
        ['90,54', 154],
    ])('%j < %j', (a, b) => expect(validateValueIsLessThan(a, b)).toBeTrue());
    test.each([
        [0, 0],
        [1.0, 1],
        ['-90,54', -90.54],
        [false, true],
        [false, false],
        [undefined, undefined],
        [true, true],
        [1.00001, 1],
        [0.00001, -1],
        ['1.00001', '1'],
        ['.00001', '-1'],
        [0, false],
        [0, true],
        [0, NaN],
        [NaN, NaN],
        [NaN, undefined],
        ['a', 9999],
        ['-0', '0'],
        ['.0', '0'],
        [',0', '0'],
        ['-,0', '0'],
        [0.0, 0],
    ])('%j different than %j', (a, b) => expect(validateValueIsLessThan(a, b)).toBeFalse());
});

describe('validation-functions.validateField', () => {
    test('isFieldRequired', () => {
        expect(validateField(500, { isFieldRequired: true }).error).toBeFalse();
        expect(validateField(0, { isFieldRequired: true, isFieldNumeric: true }).error).toBeFalse();
        expect(validateField('hello', { isFieldRequired: true }).error).toBeFalse();
        expect(validateField('', { isFieldRequired: true }).error).toBeTrue();
        expect(validateField(' ', { isFieldRequired: true }).error).toBeTrue();
        expect(validateField(null, { isFieldRequired: true }).error).toBeTrue();
        expect(validateField(undefined, { isFieldRequired: true }).error).toBeTrue();
    });

    test('isFieldNumeric', () => {
        expect(validateField(500, { isFieldNumeric: true }).error).toBeFalse();
        expect(validateField(0, { isFieldNumeric: true }).error).toBeFalse();
        expect(validateField(-0.0, { isFieldNumeric: true }).error).toBeFalse();
        expect(validateField('hello', { isFieldNumeric: true }).error).toBeTrue();
        expect(validateField('', { isFieldNumeric: true }).error).toBeFalse(); // If the field is not required, there should be no validation error
        expect(validateField('', { isFieldRequired: true, isFieldNumeric: true }).error).toBeTrue();
        expect(validateField(' ', { isFieldRequired: true, isFieldNumeric: true }).error).toBeTrue();
        expect(validateField(null, { isFieldRequired: true, isFieldNumeric: true }).error).toBeTrue();
        expect(
            validateField(undefined, {
                isFieldRequired: true,
                isFieldNumeric: true,
            }).error
        ).toBeTrue();
    });

    test('valueGreaterThanOrEqualTo', () => {
        expect(validateField(500, { valueGreaterThanOrEqualTo: 10 }).error).toBeFalse();
        expect(validateField(500, { valueGreaterThanOrEqualTo: 0 }).error).toBeFalse();
        expect(validateField(0, { valueGreaterThanOrEqualTo: 0 }).error).toBeFalse();
        expect(validateField(0, { valueGreaterThanOrEqualTo: 10 }).error).toBeTrue();
        expect(validateField(-500, { valueGreaterThanOrEqualTo: 10 }).error).toBeTrue();
        expect(validateField(-500, { valueGreaterThanOrEqualTo: 0 }).error).toBeTrue();
        expect(validateField(0, { valueGreaterThanOrEqualTo: -10 }).error).toBeFalse();
        expect(
            validateField('', {
                valueGreaterThanOrEqualTo: 2,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(
            validateField('', {
                valueGreaterThanOrEqualTo: 3,
                isFieldRequired: true,
            }).error
        ).toBeTrue();
        expect(
            validateField(' ', {
                valueGreaterThanOrEqualTo: 2,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(
            validateField(' ', {
                valueGreaterThanOrEqualTo: 3,
                isFieldRequired: true,
            }).error
        ).toBeTrue();
        expect(
            validateField(null, {
                valueGreaterThanOrEqualTo: 2,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(
            validateField(null, {
                valueGreaterThanOrEqualTo: 3,
                isFieldRequired: true,
            }).error
        ).toBeTrue();
        expect(
            validateField(undefined, {
                valueGreaterThanOrEqualTo: 2,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(
            validateField(undefined, {
                valueGreaterThanOrEqualTo: 3,
                isFieldRequired: true,
            }).error
        ).toBeTrue();
    });

    test('valueLessThanOrEqualTo', () => {
        expect(validateField(-600, { valueLessThanOrEqualTo: 10 }).error).toBeFalse();
        expect(validateField(-600, { valueLessThanOrEqualTo: 0 }).error).toBeFalse();
        expect(validateField(0, { valueLessThanOrEqualTo: -10 }).error).toBeTrue();
        expect(validateField(600, { valueLessThanOrEqualTo: 10 }).error).toBeTrue();
        expect(validateField(600, { valueLessThanOrEqualTo: 0 }).error).toBeTrue();
        expect(validateField(0, { valueLessThanOrEqualTo: 0 }).error).toBeFalse();
        expect(validateField(0, { valueLessThanOrEqualTo: 10 }).error).toBeFalse();
        expect(
            validateField('', {
                valueLessThanOrEqualTo: 20,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(validateField('', { valueLessThanOrEqualTo: 20, isFieldRequired: true }).error).toBeTrue();
        expect(
            validateField(' ', {
                valueLessThanOrEqualTo: 20,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(
            validateField(' ', {
                valueLessThanOrEqualTo: 20,
                isFieldRequired: true,
            }).error
        ).toBeTrue();
        expect(
            validateField(null, {
                valueLessThanOrEqualTo: 20,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(
            validateField(null, {
                valueLessThanOrEqualTo: 20,
                isFieldRequired: true,
            }).error
        ).toBeTrue();
        expect(
            validateField(undefined, {
                valueLessThanOrEqualTo: 20,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(
            validateField(undefined, {
                valueLessThanOrEqualTo: 20,
                isFieldRequired: true,
            }).error
        ).toBeTrue();
    });

    test('valueLessThan', () => {
        expect(validateField(600, { valueLessThan: 10 }).error).toBeTrue();
        expect(validateField(600, { valueLessThan: 0 }).error).toBeTrue();
        expect(validateField(0, { valueLessThan: 0 }).error).toBeTrue();
        expect(validateField(0, { valueLessThan: 10 }).error).toBeFalse();
        expect(validateField(-600, { valueLessThan: 10 }).error).toBeFalse();
        expect(validateField(-600, { valueLessThan: 0 }).error).toBeFalse();
        expect(validateField(0, { valueLessThan: -10 }).error).toBeTrue();
        expect(validateField('', { valueLessThan: 6, isFieldRequired: false }).error).toBeFalse();
        expect(validateField('', { valueLessThan: 6, isFieldRequired: true }).error).toBeTrue();
        expect(validateField(' ', { valueLessThan: 6, isFieldRequired: false }).error).toBeFalse();
        expect(validateField(' ', { valueLessThan: 6, isFieldRequired: true }).error).toBeTrue();
        expect(validateField(null, { valueLessThan: 6, isFieldRequired: false }).error).toBeFalse();
        expect(validateField(null, { valueLessThan: 6, isFieldRequired: true }).error).toBeTrue();
        expect(validateField(undefined, { valueLessThan: 6, isFieldRequired: false }).error).toBeFalse();
        expect(validateField(undefined, { valueLessThan: 6, isFieldRequired: true }).error).toBeTrue();
    });

    test('valueGreaterThan', () => {
        expect(validateField(600, { valueGreaterThan: 10 }).error).toBeFalse();
        expect(validateField(600, { valueGreaterThan: 0 }).error).toBeFalse();
        expect(validateField(0, { valueGreaterThan: 0 }).error).toBeTrue();
        expect(validateField(0, { valueGreaterThan: 10 }).error).toBeTrue();
        expect(validateField(-600, { valueGreaterThan: 10 }).error).toBeTrue();
        expect(validateField(-600, { valueGreaterThan: 0 }).error).toBeTrue();
        expect(validateField(0, { valueGreaterThan: -10 }).error).toBeFalse();
        expect(validateField('', { valueGreaterThan: 2, isFieldRequired: false }).error).toBeFalse();
        expect(validateField('', { valueGreaterThan: 2, isFieldRequired: true }).error).toBeTrue();
        expect(validateField(' ', { valueGreaterThan: 2, isFieldRequired: false }).error).toBeFalse();
        expect(validateField(' ', { valueGreaterThan: 2, isFieldRequired: true }).error).toBeTrue();
        expect(validateField(null, { valueGreaterThan: 2, isFieldRequired: false }).error).toBeFalse();
        expect(validateField(null, { valueGreaterThan: 2, isFieldRequired: true }).error).toBeTrue();
        expect(
            validateField(undefined, {
                valueGreaterThan: 2,
                isFieldRequired: false,
            }).error
        ).toBeFalse();
        expect(validateField(undefined, { valueGreaterThan: 2, isFieldRequired: true }).error).toBeTrue();
    });

    test('validation-functions.checkReactiveCapabilityCurve', () => {
        // Reactive capability curve default format : [{ p: '', minQ: '', maxQ: '' }, { p: '', minQ: '', maxQ: '' }]

        // Correct reactive cabability curves
        expect(
            checkReactiveCapabilityCurve([
                { p: 0, minQ: 0, maxQ: 0 },
                { p: 10, minQ: 0, maxQ: 0 },
            ]).length
        ).toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                { p: -10, minQ: -5, maxQ: -2 },
                { p: 10, minQ: 1, maxQ: 56 },
            ]).length
        ).toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                { p: -10, minQ: -5, maxQ: -2 },
                { p: 0, minQ: 0, maxQ: 0 },
                { p: 10, minQ: 1, maxQ: 56 },
            ]).length
        ).toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                { p: -10, minQ: -5, maxQ: -2 },
                // { p: 0, minQ: '0,8', maxQ: 1 },
                { p: -3, minQ: -6.5, maxQ: -2 },
                { p: 10, minQ: 1, maxQ: 56 },
            ]).length
        ).toBe(0);

        // Not enough points
        expect(checkReactiveCapabilityCurve([]).length).not.toBe(0);
        expect(checkReactiveCapabilityCurve([{ p: 0, minQ: 0, maxQ: 0 }]).length).not.toBe(0);

        // Not unique P values
        expect(
            checkReactiveCapabilityCurve([
                { p: 10, minQ: -5, maxQ: -2 },
                { p: 10, minQ: 1, maxQ: 56 },
            ]).length
        ).not.toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                { p: -10, minQ: -5, maxQ: -2 },
                { p: -0, minQ: 0, maxQ: 0 },
                { p: 0, minQ: 1, maxQ: 56 },
            ]).length
        ).not.toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                { p: -0, minQ: 0, maxQ: 0 },
                { p: 0, minQ: 0, maxQ: 0 },
            ]).length
        ).not.toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                { p: 0, minQ: 0, maxQ: 0 },
                // { p: '0.0', minQ: 0, maxQ: 0 },
            ]).length
        ).not.toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                // { p: ',0', minQ: 0, maxQ: 0 },
                { p: 0, minQ: 0, maxQ: 0 },
            ]).length
        ).not.toBe(0);

        // Pmin and Pmax values are not in the beginning and end of the array
        expect(
            checkReactiveCapabilityCurve([
                { p: 0, minQ: -5, maxQ: -2 },
                { p: -10, minQ: 0, maxQ: 0 },
                { p: 10, minQ: 1, maxQ: 56 },
            ]).length
        ).not.toBe(0);

        // P values between Pmin and Pmax are below Pmin or above Pmax
        expect(
            checkReactiveCapabilityCurve([
                { p: -10, minQ: -5, maxQ: -2 },
                { p: 260, minQ: 0, maxQ: 0 },
                { p: 10, minQ: 1, maxQ: 56 },
            ]).length
        ).not.toBe(0);
        expect(
            checkReactiveCapabilityCurve([
                { p: -10, minQ: -5, maxQ: -2 },
                { p: -20, minQ: 0, maxQ: 0 },
                { p: 10, minQ: 1, maxQ: 56 },
            ]).length
        ).not.toBe(0);
    });

    test('forceValidation', () => {
        expect(validateField(600, { valueLessThan: 10 }).error).toBeTrue();
        expect(validateField(600, { valueLessThan: 10 }, true).error).toBeFalse();
        expect(validateField(600, { valueLessThan: 10, forceValidation: true }, true).error).toBeTrue();
    });
});
