/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { areArrayElementsUnique, areNumbersOrdered, comparatorStrIgnoreCase } from './utils';

test('utils.areArrayElementsUnique', () => {
    expect(areArrayElementsUnique([1, 2, 3])).toBeTrue();
    expect(areArrayElementsUnique([1, 2, 1])).toBeFalse();
    expect(areArrayElementsUnique(['1', 1, 2])).toBeTrue();
    expect(areArrayElementsUnique([null, 0, false])).toBeTrue();
    expect(areArrayElementsUnique([null, 0, null])).toBeFalse();
    expect(areArrayElementsUnique(['-1', -1])).toBeTrue();
});

test('utils.areNumbersOrdered', () => {
    expect(areNumbersOrdered([0, 0])).toBeTrue();
    expect(areNumbersOrdered([0, 0, 0])).toBeTrue();
    expect(areNumbersOrdered([20, 20, 20])).toBeTrue();
    expect(areNumbersOrdered([-1, 0, 1])).toBeTrue();
    expect(areNumbersOrdered([-10, 0, 0])).toBeTrue();
    expect(areNumbersOrdered([0, 0, -10])).toBeTrue();
    expect(areNumbersOrdered([1, 1, -10])).toBeTrue();
    expect(areNumbersOrdered(['1', 1, '-10'])).toBeTrue();
    expect(areNumbersOrdered(['1', 3, '10'])).toBeTrue();
    expect(areNumbersOrdered(['0', 3, '10', 10])).toBeTrue();
    expect(areNumbersOrdered(['0', -3, '-10', -10])).toBeTrue();
    expect(areNumbersOrdered([3, 3, '10', '10'])).toBeTrue();
    expect(areNumbersOrdered([-3, 3, '10', '10'])).toBeTrue();
    expect(areNumbersOrdered([-3, '-2', '0', 0, '-0.0', 0.2, 0.2, 1, '5', '54', 400])).toBeTrue();
    expect(areNumbersOrdered([400, '54', '5', 1, 0.2, 0.2, '-0.0', 0, '0', '-2', -3])).toBeTrue();
    expect(areNumbersOrdered([1, 0, 1])).toBeFalse();
    expect(areNumbersOrdered([-1, 0, -1])).toBeFalse();
    expect(areNumbersOrdered([0, 0.1, 0.05])).toBeFalse();
    expect(areNumbersOrdered([0, '-0.1', -0.05])).toBeFalse();
    expect(areNumbersOrdered([0, 1, 2, 3, 4, 4, 5, 6, 5, 4, 3, 2])).toBeFalse();
    expect(areNumbersOrdered([0, 1, 2, 3, 4, 4, 5, 6, 5, 6, 7, 8])).toBeFalse();
    expect(areNumbersOrdered([-0, -1, -2, -3, -4, -4, -5, -6, -5, -6, -7, -8])).toBeFalse();
    expect(areNumbersOrdered([1, 2, NaN, 3])).toBeFalse(); // Only numbers allowed
    expect(areNumbersOrdered([1, 2, 'three', 4])).toBeFalse();
    expect(areNumbersOrdered([1])).toBeTrue();
    expect(areNumbersOrdered([NaN])).toBeFalse();
    expect(areNumbersOrdered([true])).toBeFalse();
    expect(areNumbersOrdered([null])).toBeFalse();
    expect(areNumbersOrdered([false])).toBeFalse();
    expect(areNumbersOrdered([false, 5])).toBeFalse();
    expect(areNumbersOrdered(['hello'])).toBeFalse();
    expect(areNumbersOrdered([])).toBeTrue();
    expect(areNumbersOrdered(undefined)).toBeFalse();
    expect(areNumbersOrdered({})).toBeFalse();
    expect(areNumbersOrdered({ length: 1 })).toBeFalse();
});

test('utils.comparatorStrIgnoreCase', () => {
    expect(comparatorStrIgnoreCase('abc', 'abc')).toBe(0);
    expect(comparatorStrIgnoreCase('abc', 'def')).not.toBe(0);
    expect(comparatorStrIgnoreCase('abc', 'ABC')).toBe(0);
    expect(comparatorStrIgnoreCase('abc', 'àbç')).not.toBe(0);
    expect(comparatorStrIgnoreCase('abc', 'àbç', false)).not.toBe(0);
    expect(comparatorStrIgnoreCase('abc', 'àbç', true)).toBe(0);
});
