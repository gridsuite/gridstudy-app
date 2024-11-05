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

test('validation-functions.isBlankOrEmpty', () => {
    expect(isBlankOrEmpty('hello')).toBeFalsy();
    expect(isBlankOrEmpty('0')).toBeFalsy();
    expect(isBlankOrEmpty(0)).toBeFalsy();
    expect(isBlankOrEmpty(false)).toBeFalsy();
    expect(isBlankOrEmpty(true)).toBeFalsy();
    expect(isBlankOrEmpty(' ')).toBeTruthy();
    expect(isBlankOrEmpty(null)).toBeTruthy();
    expect(isBlankOrEmpty(undefined)).toBeTruthy();
});

test('validation-functions.toNumber', () => {
    expect(toNumber('')).toBeNaN();
    expect(toNumber(undefined)).toBeNaN();
    expect(toNumber(null)).toBeNaN();
    expect(toNumber(false)).toBeNaN();
    expect(toNumber(true)).toBeNaN();
    expect(toNumber(NaN)).toBeNaN();
    expect(toNumber('hello')).toBeNaN();
    expect(toNumber({ 0: 1 })).toBeNaN();
    expect(toNumber([10])).toBeNaN();
    expect(toNumber('  0020,5000  ')).toBe(20.5);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(',0')).toBe(0);
    expect(toNumber(0.99999)).not.toBe(1);

    // Converted values must be equal in these cases
    expect(toNumber(-0) === toNumber(0)).toBeTrue();
    expect(toNumber(0.0) === toNumber(0)).toBeTrue();
    expect(toNumber(-0.0) === toNumber(0)).toBeTrue();
    expect(toNumber('-0') === toNumber(0)).toBeTrue();
    expect(toNumber('0,0') === toNumber(0)).toBeTrue();
    expect(toNumber(',0') === toNumber(0)).toBeTrue();
    expect(toNumber('-.000') === toNumber(0)).toBeTrue();
    expect(toNumber('-,000') === toNumber(0)).toBeTrue();
});

test('validation-functions.validateValueIsANumber', () => {
    expect(validateValueIsANumber(10)).toBeTrue();
    expect(validateValueIsANumber(0)).toBeTrue();
    expect(validateValueIsANumber('0')).toBeTrue();
    expect(validateValueIsANumber('-0')).toBeTrue();
    expect(validateValueIsANumber('-10')).toBeTrue();
    expect(validateValueIsANumber('-.0')).toBeTrue();
    expect(validateValueIsANumber('-,0')).toBeTrue();
    expect(validateValueIsANumber('.0')).toBeTrue();
    expect(validateValueIsANumber('0.510')).toBeTrue();
    expect(validateValueIsANumber(',510')).toBeTrue();
    expect(validateValueIsANumber('-,510')).toBeTrue();
    expect(validateValueIsANumber('  -,510   ')).toBeTrue();
    expect(validateValueIsANumber(55.51)).toBeTrue();
    expect(validateValueIsANumber(-55.51)).toBeTrue();
    expect(validateValueIsANumber('-55,51')).toBeTrue();
    expect(validateValueIsANumber('-55,')).toBeTrue();
    expect(validateValueIsANumber('-55.')).toBeTrue();
    expect(validateValueIsANumber(null)).toBeFalse();
    expect(validateValueIsANumber(NaN)).toBeFalse();
    expect(validateValueIsANumber(undefined)).toBeFalse();
    expect(validateValueIsANumber(false)).toBeFalse();
    expect(validateValueIsANumber('hello')).toBeFalse();
    expect(validateValueIsANumber('15.564,54')).toBeFalse();
    expect(validateValueIsANumber(true)).toBeFalse();
    expect(validateValueIsANumber('')).toBeFalse();
});

test('validation-functions.validateValueIsLessThanOrEqualTo', () => {
    expect(validateValueIsLessThanOrEqualTo(0, 0)).toBeTrue();
    expect(validateValueIsLessThanOrEqualTo(0, 1)).toBeTrue();
    expect(validateValueIsLessThanOrEqualTo(1.0, 1)).toBeTrue();
    expect(validateValueIsLessThanOrEqualTo(0.9, 0.91)).toBeTrue();
    expect(validateValueIsLessThanOrEqualTo(-0.91, -0.9)).toBeTrue();
    expect(validateValueIsLessThanOrEqualTo('90,54', 154)).toBeTrue();
    expect(validateValueIsLessThanOrEqualTo('-90,54', -90.54)).toBeTrue();
    expect(validateValueIsLessThanOrEqualTo(false, true)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(false, false)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(undefined, undefined)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(true, true)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(1.00001, 1)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(0.00001, -1)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo('1.00001', '1')).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo('.00001', '-1')).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(0, false)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(0, true)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(0, NaN)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(NaN, NaN)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo(NaN, undefined)).toBeFalse();
    expect(validateValueIsLessThanOrEqualTo('a', 9999)).toBeFalse();
});

test('validation-functions.validateValueIsLessThan', () => {
    expect(validateValueIsLessThan(0, 0)).toBeFalse();
    expect(validateValueIsLessThan(0, 1)).toBeTrue();
    expect(validateValueIsLessThan(1.0, 1)).toBeFalse();
    expect(validateValueIsLessThan(0.9, 0.91)).toBeTrue();
    expect(validateValueIsLessThan(-0.91, -0.9)).toBeTrue();
    expect(validateValueIsLessThan('90,54', 154)).toBeTrue();
    expect(validateValueIsLessThan('-90,54', -90.54)).toBeFalse();
    expect(validateValueIsLessThan(false, true)).toBeFalse();
    expect(validateValueIsLessThan(false, false)).toBeFalse();
    expect(validateValueIsLessThan(undefined, undefined)).toBeFalse();
    expect(validateValueIsLessThan(true, true)).toBeFalse();
    expect(validateValueIsLessThan(1.00001, 1)).toBeFalse();
    expect(validateValueIsLessThan(0.00001, -1)).toBeFalse();
    expect(validateValueIsLessThan('1.00001', '1')).toBeFalse();
    expect(validateValueIsLessThan('.00001', '-1')).toBeFalse();
    expect(validateValueIsLessThan(0, false)).toBeFalse();
    expect(validateValueIsLessThan(0, true)).toBeFalse();
    expect(validateValueIsLessThan(0, NaN)).toBeFalse();
    expect(validateValueIsLessThan(NaN, NaN)).toBeFalse();
    expect(validateValueIsLessThan(NaN, undefined)).toBeFalse();
    expect(validateValueIsLessThan('a', 9999)).toBeFalse();
    expect(validateValueIsLessThan('-0', '0')).toBeFalse();
    expect(validateValueIsLessThan('.0', '0')).toBeFalse();
    expect(validateValueIsLessThan(',0', '0')).toBeFalse();
    expect(validateValueIsLessThan('-,0', '0')).toBeFalse();
    expect(validateValueIsLessThan(0.0, 0)).toBeFalse();
});

test('validation-functions.validateField.isFieldRequired', () => {
    expect(validateField(500, { isFieldRequired: true }).error).toBeFalse();
    expect(validateField(0, { isFieldRequired: true, isFieldNumeric: true }).error).toBeFalse();
    expect(validateField('hello', { isFieldRequired: true }).error).toBeFalse();
    expect(validateField('', { isFieldRequired: true }).error).toBeTrue();
    expect(validateField(' ', { isFieldRequired: true }).error).toBeTrue();
    expect(validateField(null, { isFieldRequired: true }).error).toBeTrue();
    expect(validateField(undefined, { isFieldRequired: true }).error).toBeTrue();
});

test('validation-functions.validateField.isFieldNumeric', () => {
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

test('validation-functions.validateField.valueGreaterThanOrEqualTo', () => {
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

test('validation-functions.validateField.valueLessThanOrEqualTo', () => {
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

test('validation-functions.validateField.valueLessThan', () => {
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

test('validation-functions.validateField.valueGreaterThan', () => {
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
            { p: '0', minQ: '0', maxQ: '0' },
            { p: '10', minQ: '0', maxQ: '0' },
        ]).length
    ).toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: '-10', minQ: '-5', maxQ: '-2' },
            { p: '10', minQ: '1', maxQ: '56' },
        ]).length
    ).toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: '-10', minQ: '-5', maxQ: '-2' },
            { p: '0', minQ: '0', maxQ: '0' },
            { p: '10', minQ: '1', maxQ: '56' },
        ]).length
    ).toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: '-10', minQ: '-5', maxQ: '-2' },
            { p: '0', minQ: '0,8', maxQ: '1' },
            { p: '-3', minQ: '-6.5', maxQ: '-2' },
            { p: '10', minQ: '1', maxQ: '56' },
        ]).length
    ).toBe(0);

    // Not enough points
    expect(checkReactiveCapabilityCurve([]).length).not.toBe(0);
    expect(checkReactiveCapabilityCurve([{ p: '0', minQ: '0', maxQ: '0' }]).length).not.toBe(0);

    // Not unique P values
    expect(
        checkReactiveCapabilityCurve([
            { p: '10', minQ: '-5', maxQ: '-2' },
            { p: '10', minQ: '1', maxQ: '56' },
        ]).length
    ).not.toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: '-10', minQ: '-5', maxQ: '-2' },
            { p: '-0', minQ: '0', maxQ: '0' },
            { p: '0', minQ: '1', maxQ: '56' },
        ]).length
    ).not.toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: '-0', minQ: '0', maxQ: '0' },
            { p: '0', minQ: '0', maxQ: '0' },
        ]).length
    ).not.toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: '0', minQ: '0', maxQ: '0' },
            { p: '0.0', minQ: '0', maxQ: '0' },
        ]).length
    ).not.toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: ',0', minQ: '0', maxQ: '0' },
            { p: '0', minQ: '0', maxQ: '0' },
        ]).length
    ).not.toBe(0);

    // Pmin and Pmax values are not in the begining and end of the array
    expect(
        checkReactiveCapabilityCurve([
            { p: '0', minQ: '-5', maxQ: '-2' },
            { p: '-10', minQ: '0', maxQ: '0' },
            { p: '10', minQ: '1', maxQ: '56' },
        ]).length
    ).not.toBe(0);

    // P values between Pmin and Pmax are below Pmin or above Pmax
    expect(
        checkReactiveCapabilityCurve([
            { p: '-10', minQ: '-5', maxQ: '-2' },
            { p: '260', minQ: '0', maxQ: '0' },
            { p: '10', minQ: '1', maxQ: '56' },
        ]).length
    ).not.toBe(0);
    expect(
        checkReactiveCapabilityCurve([
            { p: '-10', minQ: '-5', maxQ: '-2' },
            { p: '-20', minQ: '0', maxQ: '0' },
            { p: '10', minQ: '1', maxQ: '56' },
        ]).length
    ).not.toBe(0);
});

test('validation-functions.validateField.forceValidation', () => {
    expect(validateField(600, { valueLessThan: 10 }).error).toBeTrue();
    expect(validateField(600, { valueLessThan: 10 }, true).error).toBeFalse();
    expect(validateField(600, { valueLessThan: 10, forceValidation: true }, true).error).toBeTrue();
});
