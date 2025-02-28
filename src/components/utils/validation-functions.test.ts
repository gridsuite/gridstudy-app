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
    expect(toNumber(-0) === toNumber(0)).toBe(true);
    expect(toNumber(0.0) === toNumber(0)).toBe(true);
    expect(toNumber(-0.0) === toNumber(0)).toBe(true);
    expect(toNumber('-0') === toNumber(0)).toBe(true);
    expect(toNumber('0,0') === toNumber(0)).toBe(true);
    expect(toNumber(',0') === toNumber(0)).toBe(true);
    expect(toNumber('-.000') === toNumber(0)).toBe(true);
    expect(toNumber('-,000') === toNumber(0)).toBe(true);
});

test('validation-functions.validateValueIsANumber', () => {
    expect(validateValueIsANumber(10)).toBe(true);
    expect(validateValueIsANumber(0)).toBe(true);
    expect(validateValueIsANumber('0')).toBe(true);
    expect(validateValueIsANumber('-0')).toBe(true);
    expect(validateValueIsANumber('-10')).toBe(true);
    expect(validateValueIsANumber('-.0')).toBe(true);
    expect(validateValueIsANumber('-,0')).toBe(true);
    expect(validateValueIsANumber('.0')).toBe(true);
    expect(validateValueIsANumber('0.510')).toBe(true);
    expect(validateValueIsANumber(',510')).toBe(true);
    expect(validateValueIsANumber('-,510')).toBe(true);
    expect(validateValueIsANumber('  -,510   ')).toBe(true);
    expect(validateValueIsANumber(55.51)).toBe(true);
    expect(validateValueIsANumber(-55.51)).toBe(true);
    expect(validateValueIsANumber('-55,51')).toBe(true);
    expect(validateValueIsANumber('-55,')).toBe(true);
    expect(validateValueIsANumber('-55.')).toBe(true);
    expect(validateValueIsANumber(null)).toBe(false);
    expect(validateValueIsANumber(NaN)).toBe(false);
    expect(validateValueIsANumber(undefined)).toBe(false);
    expect(validateValueIsANumber(false)).toBe(false);
    expect(validateValueIsANumber('hello')).toBe(false);
    expect(validateValueIsANumber('15.564,54')).toBe(false);
    expect(validateValueIsANumber(true)).toBe(false);
    expect(validateValueIsANumber('')).toBe(false);
});

test('validation-functions.validateValueIsLessThanOrEqualTo', () => {
    expect(validateValueIsLessThanOrEqualTo(0, 0)).toBe(true);
    expect(validateValueIsLessThanOrEqualTo(0, 1)).toBe(true);
    expect(validateValueIsLessThanOrEqualTo(1.0, 1)).toBe(true);
    expect(validateValueIsLessThanOrEqualTo(0.9, 0.91)).toBe(true);
    expect(validateValueIsLessThanOrEqualTo(-0.91, -0.9)).toBe(true);
    expect(validateValueIsLessThanOrEqualTo('90,54', 154)).toBe(true);
    expect(validateValueIsLessThanOrEqualTo('-90,54', -90.54)).toBe(true);
    expect(validateValueIsLessThanOrEqualTo(false, true)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(false, false)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(undefined, undefined)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(true, true)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(1.00001, 1)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(0.00001, -1)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo('1.00001', '1')).toBe(false);
    expect(validateValueIsLessThanOrEqualTo('.00001', '-1')).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(0, false)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(0, true)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(0, NaN)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(NaN, NaN)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo(NaN, undefined)).toBe(false);
    expect(validateValueIsLessThanOrEqualTo('a', 9999)).toBe(false);
});

test('validation-functions.validateValueIsLessThan', () => {
    expect(validateValueIsLessThan(0, 0)).toBe(false);
    expect(validateValueIsLessThan(0, 1)).toBe(true);
    expect(validateValueIsLessThan(1.0, 1)).toBe(false);
    expect(validateValueIsLessThan(0.9, 0.91)).toBe(true);
    expect(validateValueIsLessThan(-0.91, -0.9)).toBe(true);
    expect(validateValueIsLessThan('90,54', 154)).toBe(true);
    expect(validateValueIsLessThan('-90,54', -90.54)).toBe(false);
    expect(validateValueIsLessThan(false, true)).toBe(false);
    expect(validateValueIsLessThan(false, false)).toBe(false);
    expect(validateValueIsLessThan(undefined, undefined)).toBe(false);
    expect(validateValueIsLessThan(true, true)).toBe(false);
    expect(validateValueIsLessThan(1.00001, 1)).toBe(false);
    expect(validateValueIsLessThan(0.00001, -1)).toBe(false);
    expect(validateValueIsLessThan('1.00001', '1')).toBe(false);
    expect(validateValueIsLessThan('.00001', '-1')).toBe(false);
    expect(validateValueIsLessThan(0, false)).toBe(false);
    expect(validateValueIsLessThan(0, true)).toBe(false);
    expect(validateValueIsLessThan(0, NaN)).toBe(false);
    expect(validateValueIsLessThan(NaN, NaN)).toBe(false);
    expect(validateValueIsLessThan(NaN, undefined)).toBe(false);
    expect(validateValueIsLessThan('a', 9999)).toBe(false);
    expect(validateValueIsLessThan('-0', '0')).toBe(false);
    expect(validateValueIsLessThan('.0', '0')).toBe(false);
    expect(validateValueIsLessThan(',0', '0')).toBe(false);
    expect(validateValueIsLessThan('-,0', '0')).toBe(false);
    expect(validateValueIsLessThan(0.0, 0)).toBe(false);
});

test('validation-functions.validateField.isFieldRequired', () => {
    expect(validateField(500, { isFieldRequired: true }).error).toBe(false);
    expect(validateField(0, { isFieldRequired: true, isFieldNumeric: true }).error).toBe(false);
    expect(validateField('hello', { isFieldRequired: true }).error).toBe(false);
    expect(validateField('', { isFieldRequired: true }).error).toBe(true);
    expect(validateField(' ', { isFieldRequired: true }).error).toBe(true);
    expect(validateField(null, { isFieldRequired: true }).error).toBe(true);
    expect(validateField(undefined, { isFieldRequired: true }).error).toBe(true);
});

test('validation-functions.validateField.isFieldNumeric', () => {
    expect(validateField(500, { isFieldNumeric: true }).error).toBe(false);
    expect(validateField(0, { isFieldNumeric: true }).error).toBe(false);
    expect(validateField(-0.0, { isFieldNumeric: true }).error).toBe(false);
    expect(validateField('hello', { isFieldNumeric: true }).error).toBe(true);
    expect(validateField('', { isFieldNumeric: true }).error).toBe(false); // If the field is not required, there should be no validation error
    expect(validateField('', { isFieldRequired: true, isFieldNumeric: true }).error).toBe(true);
    expect(validateField(' ', { isFieldRequired: true, isFieldNumeric: true }).error).toBe(true);
    expect(validateField(null, { isFieldRequired: true, isFieldNumeric: true }).error).toBe(true);
    expect(
        validateField(undefined, {
            isFieldRequired: true,
            isFieldNumeric: true,
        }).error
    ).toBe(true);
});

test('validation-functions.validateField.valueGreaterThanOrEqualTo', () => {
    expect(validateField(500, { valueGreaterThanOrEqualTo: 10 }).error).toBe(false);
    expect(validateField(500, { valueGreaterThanOrEqualTo: 0 }).error).toBe(false);
    expect(validateField(0, { valueGreaterThanOrEqualTo: 0 }).error).toBe(false);
    expect(validateField(0, { valueGreaterThanOrEqualTo: 10 }).error).toBe(true);
    expect(validateField(-500, { valueGreaterThanOrEqualTo: 10 }).error).toBe(true);
    expect(validateField(-500, { valueGreaterThanOrEqualTo: 0 }).error).toBe(true);
    expect(validateField(0, { valueGreaterThanOrEqualTo: -10 }).error).toBe(false);
    expect(
        validateField('', {
            valueGreaterThanOrEqualTo: 2,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(
        validateField('', {
            valueGreaterThanOrEqualTo: 3,
            isFieldRequired: true,
        }).error
    ).toBe(true);
    expect(
        validateField(' ', {
            valueGreaterThanOrEqualTo: 2,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(
        validateField(' ', {
            valueGreaterThanOrEqualTo: 3,
            isFieldRequired: true,
        }).error
    ).toBe(true);
    expect(
        validateField(null, {
            valueGreaterThanOrEqualTo: 2,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(
        validateField(null, {
            valueGreaterThanOrEqualTo: 3,
            isFieldRequired: true,
        }).error
    ).toBe(true);
    expect(
        validateField(undefined, {
            valueGreaterThanOrEqualTo: 2,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(
        validateField(undefined, {
            valueGreaterThanOrEqualTo: 3,
            isFieldRequired: true,
        }).error
    ).toBe(true);
});

test('validation-functions.validateField.valueLessThanOrEqualTo', () => {
    expect(validateField(-600, { valueLessThanOrEqualTo: 10 }).error).toBe(false);
    expect(validateField(-600, { valueLessThanOrEqualTo: 0 }).error).toBe(false);
    expect(validateField(0, { valueLessThanOrEqualTo: -10 }).error).toBe(true);
    expect(validateField(600, { valueLessThanOrEqualTo: 10 }).error).toBe(true);
    expect(validateField(600, { valueLessThanOrEqualTo: 0 }).error).toBe(true);
    expect(validateField(0, { valueLessThanOrEqualTo: 0 }).error).toBe(false);
    expect(validateField(0, { valueLessThanOrEqualTo: 10 }).error).toBe(false);
    expect(
        validateField('', {
            valueLessThanOrEqualTo: 20,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(validateField('', { valueLessThanOrEqualTo: 20, isFieldRequired: true }).error).toBe(true);
    expect(
        validateField(' ', {
            valueLessThanOrEqualTo: 20,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(
        validateField(' ', {
            valueLessThanOrEqualTo: 20,
            isFieldRequired: true,
        }).error
    ).toBe(true);
    expect(
        validateField(null, {
            valueLessThanOrEqualTo: 20,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(
        validateField(null, {
            valueLessThanOrEqualTo: 20,
            isFieldRequired: true,
        }).error
    ).toBe(true);
    expect(
        validateField(undefined, {
            valueLessThanOrEqualTo: 20,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(
        validateField(undefined, {
            valueLessThanOrEqualTo: 20,
            isFieldRequired: true,
        }).error
    ).toBe(true);
});

test('validation-functions.validateField.valueLessThan', () => {
    expect(validateField(600, { valueLessThan: 10 }).error).toBe(true);
    expect(validateField(600, { valueLessThan: 0 }).error).toBe(true);
    expect(validateField(0, { valueLessThan: 0 }).error).toBe(true);
    expect(validateField(0, { valueLessThan: 10 }).error).toBe(false);
    expect(validateField(-600, { valueLessThan: 10 }).error).toBe(false);
    expect(validateField(-600, { valueLessThan: 0 }).error).toBe(false);
    expect(validateField(0, { valueLessThan: -10 }).error).toBe(true);
    expect(validateField('', { valueLessThan: 6, isFieldRequired: false }).error).toBe(false);
    expect(validateField('', { valueLessThan: 6, isFieldRequired: true }).error).toBe(true);
    expect(validateField(' ', { valueLessThan: 6, isFieldRequired: false }).error).toBe(false);
    expect(validateField(' ', { valueLessThan: 6, isFieldRequired: true }).error).toBe(true);
    expect(validateField(null, { valueLessThan: 6, isFieldRequired: false }).error).toBe(false);
    expect(validateField(null, { valueLessThan: 6, isFieldRequired: true }).error).toBe(true);
    expect(validateField(undefined, { valueLessThan: 6, isFieldRequired: false }).error).toBe(false);
    expect(validateField(undefined, { valueLessThan: 6, isFieldRequired: true }).error).toBe(true);
});

test('validation-functions.validateField.valueGreaterThan', () => {
    expect(validateField(600, { valueGreaterThan: 10 }).error).toBe(false);
    expect(validateField(600, { valueGreaterThan: 0 }).error).toBe(false);
    expect(validateField(0, { valueGreaterThan: 0 }).error).toBe(true);
    expect(validateField(0, { valueGreaterThan: 10 }).error).toBe(true);
    expect(validateField(-600, { valueGreaterThan: 10 }).error).toBe(true);
    expect(validateField(-600, { valueGreaterThan: 0 }).error).toBe(true);
    expect(validateField(0, { valueGreaterThan: -10 }).error).toBe(false);
    expect(validateField('', { valueGreaterThan: 2, isFieldRequired: false }).error).toBe(false);
    expect(validateField('', { valueGreaterThan: 2, isFieldRequired: true }).error).toBe(true);
    expect(validateField(' ', { valueGreaterThan: 2, isFieldRequired: false }).error).toBe(false);
    expect(validateField(' ', { valueGreaterThan: 2, isFieldRequired: true }).error).toBe(true);
    expect(validateField(null, { valueGreaterThan: 2, isFieldRequired: false }).error).toBe(false);
    expect(validateField(null, { valueGreaterThan: 2, isFieldRequired: true }).error).toBe(true);
    expect(
        validateField(undefined, {
            valueGreaterThan: 2,
            isFieldRequired: false,
        }).error
    ).toBe(false);
    expect(validateField(undefined, { valueGreaterThan: 2, isFieldRequired: true }).error).toBe(true);
});

test('validation-functions.validateField.forceValidation', () => {
    expect(validateField(600, { valueLessThan: 10 }).error).toBe(true);
    expect(validateField(600, { valueLessThan: 10 }, true).error).toBe(false);
    expect(validateField(600, { valueLessThan: 10, forceValidation: true }, true).error).toBe(true);
});
