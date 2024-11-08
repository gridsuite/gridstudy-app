/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { areArrayElementsUnique, areNumbersOrdered, comparatorStrIgnoreCase } from './utils';

const expectToBeTrue = (value: boolean) => expect(value).toBeTrue();
const expectToBeFalse = (value: boolean) => expect(value).toBeFalse();

describe('utils.areArrayElementsUnique', () => {
    test.each([
        [[1, 2, 3], true],
        [[1, 2, 1], false],
        [['1', 1, 2], true],
        [[null, 0, false], true],
        [[null, 0, null], false],
        [['-1', -1], true],
    ])('areArrayElementsUnique(%j) == %p', (args, expected) =>
        (expected ? expectToBeTrue : expectToBeFalse)(areArrayElementsUnique(args))
    );
});

describe('utils.areNumbersOrdered', () => {
    test.each([
        [[0, 0], true],
        [[0, 0, 0], true],
        [[20, 20, 20], true],
        [[-1, 0, 1], true],
        [[-10, 0, 0], true],
        [[0, 0, -10], true],
        [[1, 1, -10], true],
        [['1', 1, '-10'], true],
        [['1', 3, '10'], true],
        [['0', 3, '10', 10], true],
        [['0', -3, '-10', -10], true],
        [[3, 3, '10', '10'], true],
        [[-3, 3, '10', '10'], true],
        [[-3, '-2', '0', 0, '-0.0', 0.2, 0.2, 1, '5', '54', 400], true],
        [[400, '54', '5', 1, 0.2, 0.2, '-0.0', 0, '0', '-2', -3], true],
        [[1, 0, 1], false],
        [[-1, 0, -1], false],
        [[0, 0.1, 0.05], false],
        [[0, '-0.1', -0.05], false],
        [[0, 1, 2, 3, 4, 4, 5, 6, 5, 4, 3, 2], false],
        [[0, 1, 2, 3, 4, 4, 5, 6, 5, 6, 7, 8], false],
        [[-0, -1, -2, -3, -4, -4, -5, -6, -5, -6, -7, -8], false],
        [[1, 2, NaN, 3], false], // Only numbers allowed
        [[1, 2, 'three', 4], false],
        [[1], true],
        [[NaN], false],
        [[true], false],
        [[null], false],
        [[false], false],
        [[false, 5], false],
        [['hello'], false],
        [[], true],
        [undefined, false],
        [{}, false],
        [{ length: 1 }, false],
    ])('areNumbersOrdered(%j) == %p', (args, expected) =>
        (expected ? expectToBeTrue : expectToBeFalse)(areNumbersOrdered(args))
    );
});

describe('utils.comparatorStrIgnoreCase', () => {
    test.each([
        { str1: 'abc', str2: 'abc', ignoreAccent: undefined, expectZero: true },
        { str1: 'abc', str2: 'def', ignoreAccent: undefined, expectZero: false },
        { str1: 'abc', str2: 'ABC', ignoreAccent: undefined, expectZero: true },
        { str1: 'abc', str2: 'àbç', ignoreAccent: undefined, expectZero: false },
        { str1: 'abc', str2: 'àbç', ignoreAccent: false, expectZero: false },
        { str1: 'abc', str2: 'àbç', ignoreAccent: true, expectZero: true },
    ])('comparatorStrIgnoreCase($str1, $str2)', ({ str1, str2, ignoreAccent, expectZero }) => {
        const exceptResult = expect(comparatorStrIgnoreCase(str1, str2, ignoreAccent));
        if (expectZero) {
            exceptResult.toBe(0);
        } else {
            exceptResult.not.toBe(0);
        }
    });
});
