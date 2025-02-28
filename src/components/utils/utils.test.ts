/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { areArrayElementsUnique, areNumbersOrdered } from './utils';

test('utils.areArrayElementsUnique', () => {
    expect(areArrayElementsUnique([1, 2, 3])).toBeTruthy();
    expect(areArrayElementsUnique([1, 2, 1])).toBeFalsy();
    expect(areArrayElementsUnique(['1', 1, 2])).toBeTruthy();
    expect(areArrayElementsUnique([null, 0, false])).toBeTruthy();
    expect(areArrayElementsUnique([null, 0, null])).toBeFalsy();
    expect(areArrayElementsUnique(['-1', -1])).toBeTruthy();
});

test('utils.areNumbersOrdered', () => {
    expect(areNumbersOrdered([0, 0])).toBeTruthy();
    expect(areNumbersOrdered([0, 0, 0])).toBeTruthy();
    expect(areNumbersOrdered([20, 20, 20])).toBeTruthy();
    expect(areNumbersOrdered([-1, 0, 1])).toBeTruthy();
    expect(areNumbersOrdered([-10, 0, 0])).toBeTruthy();
    expect(areNumbersOrdered([0, 0, -10])).toBeTruthy();
    expect(areNumbersOrdered([1, 1, -10])).toBeTruthy();
    expect(areNumbersOrdered(['1', 1, '-10'])).toBeTruthy();
    expect(areNumbersOrdered(['1', 3, '10'])).toBeTruthy();
    expect(areNumbersOrdered(['0', 3, '10', 10])).toBeTruthy();
    expect(areNumbersOrdered(['0', -3, '-10', -10])).toBeTruthy();
    expect(areNumbersOrdered([3, 3, '10', '10'])).toBeTruthy();
    expect(areNumbersOrdered([-3, 3, '10', '10'])).toBeTruthy();
    expect(areNumbersOrdered([-3, '-2', '0', 0, '-0.0', 0.2, 0.2, 1, '5', '54', 400])).toBeTruthy();
    expect(areNumbersOrdered([400, '54', '5', 1, 0.2, 0.2, '-0.0', 0, '0', '-2', -3])).toBeTruthy();
    expect(areNumbersOrdered([1, 0, 1])).toBeFalsy();
    expect(areNumbersOrdered([-1, 0, -1])).toBeFalsy();
    expect(areNumbersOrdered([0, 0.1, 0.05])).toBeFalsy();
    expect(areNumbersOrdered([0, '-0.1', -0.05])).toBeFalsy();
    expect(areNumbersOrdered([0, 1, 2, 3, 4, 4, 5, 6, 5, 4, 3, 2])).toBeFalsy();
    expect(areNumbersOrdered([0, 1, 2, 3, 4, 4, 5, 6, 5, 6, 7, 8])).toBeFalsy();
    expect(areNumbersOrdered([-0, -1, -2, -3, -4, -4, -5, -6, -5, -6, -7, -8])).toBeFalsy();
    expect(areNumbersOrdered([1, 2, NaN, 3])).toBeFalsy(); // Only numbers allowed
    expect(areNumbersOrdered([1, 2, 'three', 4])).toBeFalsy();
    expect(areNumbersOrdered([1])).toBeTruthy();
    expect(areNumbersOrdered([NaN])).toBeFalsy();
    expect(areNumbersOrdered([true])).toBeFalsy();
    expect(areNumbersOrdered([null])).toBeFalsy();
    expect(areNumbersOrdered([false])).toBeFalsy();
    expect(areNumbersOrdered([false, 5])).toBeFalsy();
    expect(areNumbersOrdered(['hello'])).toBeFalsy();
    expect(areNumbersOrdered([])).toBeTruthy();
    expect(areNumbersOrdered()).toBeFalsy();
    expect(areNumbersOrdered({})).toBeFalsy();
    expect(areNumbersOrdered({ length: 1 })).toBeFalsy();
});
