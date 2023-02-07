import React from 'react';
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
    expect(
        areNumbersOrdered([
            -3,
            '-2',
            '0',
            0,
            '-0.0',
            0.2,
            0.2,
            1,
            '5',
            '54',
            400,
        ])
    ).toBeTruthy();
    expect(
        areNumbersOrdered([
            400,
            '54',
            '5',
            1,
            0.2,
            0.2,
            '-0.0',
            0,
            '0',
            '-2',
            -3,
        ])
    ).toBeTruthy();
    expect(areNumbersOrdered([1, 0, 1])).toBeFalsy();
    expect(areNumbersOrdered([-1, 0, -1])).toBeFalsy();
    expect(areNumbersOrdered([0, 0.1, 0.05])).toBeFalsy();
    expect(areNumbersOrdered([0, '-0.1', -0.05])).toBeFalsy();
    expect(areNumbersOrdered([0, 1, 2, 3, 4, 4, 5, 6, 5, 4, 3, 2])).toBeFalsy();
    expect(areNumbersOrdered([0, 1, 2, 3, 4, 4, 5, 6, 5, 6, 7, 8])).toBeFalsy();
    expect(
        areNumbersOrdered([-0, -1, -2, -3, -4, -4, -5, -6, -5, -6, -7, -8])
    ).toBeFalsy();
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
});
