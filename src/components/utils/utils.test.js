/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { areArrayElementsUnique, areNumbersOrdered } from './utils';

const error = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('utils', () => {
    beforeEach(() => {
        error.mockClear();
    });

    it.each([
        {
            array: [1, 2, 3],
            expected: true,
            title: 'all unique (case 1)',
        },
        {
            array: [null, 0, false],
            expected: true,
            title: 'all unique (case 2)',
        },
        {
            array: [1, 2, 1],
            expected: false,
            title: 'one duplicate (case 1)',
        },
        {
            array: [null, 0, null],
            expected: false,
            title: 'une duplicate (case 2)',
        },
        {
            array: ['1', 1, 2],
            expected: true,
            title: 'same value but not same type (case 1)',
        },
        {
            array: ['-1', -1],
            expected: true,
            title: 'same value but not same type (case 2)',
        },
    ])('areArrayElementsUnique $title', ({ array, expected }) => {
        expect(areArrayElementsUnique(array)).toBe(expected);
    });

    it.each([
        {
            array: [],
            expected: true,
            title: 'no item',
        },
        {
            array: [0],
            expected: true,
            title: 'one item',
        },
        {
            array: [0, 0],
            expected: true,
            title: 'same Number (case 1)',
        },
        {
            array: [0, 0, 0],
            expected: true,
            title: 'same Number (case 2)',
        },
        {
            array: [20, 20, 20],
            expected: true,
            title: 'same Number (case 3)',
        },
        {
            array: [-1, 0, 1],
            expected: true,
            title: 'ordered data',
        },
        {
            array: [-10, 0, 0],
            expected: true,
            title: 'ordered and duplicate data (case 1)',
        },
        {
            array: [0, 0, -10],
            expected: true,
            title: 'ordered desc and duplicate data (case 1)',
        },
        {
            array: [1, 1, -10],
            expected: true,
            title: 'ordered desc and duplicate data (case 2)',
        },
        {
            array: ['1', 1, '-10'],
            expected: true,
            title: 'ordered and duplicate mixte type data (case 1)',
        },
        {
            array: ['0', 3, '10', 10],
            expected: true,
            title: 'ordered and duplicate mixte type data (case 2)',
        },
        {
            array: ['0', -3, '-10', -10],
            expected: true,
            title: 'ordered and duplicate mixte type data (case 3)',
        },
        {
            array: [3, 3, '10', '10'],
            expected: true,
            title: 'ordered and duplicate mixte type data (case 4)',
        },
        {
            array: [-3, 3, '10', '10'],
            expected: true,
            title: 'ordered and duplicate mixte type data (case 5)',
        },
        {
            array: ['1', 3, '10'],
            expected: true,
            title: 'ordered mixte type data',
        },
        {
            array: [-3, '-2', '0', 0, '-0.0', 0.2, 0.2, 1, '5', '54', 400],
            expected: true,
            title: 'ordered asc large mixte type data',
        },
        {
            array: [400, '54', '5', 1, 0.2, 0.2, '-0.0', 0, '0', '-2', -3],
            expected: true,
            title: 'ordered desc large mixte type data',
        },
        {
            array: [1, 0, 1],
            expected: false,
            title: 'not ordered desc then asc (case 1)',
        },
        {
            array: [0, '-0.1', -0.05],
            expected: false,
            title: 'not ordered desc then asc (case 2)',
        },
        {
            array: [-1, 0, -1],
            expected: false,
            title: 'not ordered asc then desc (case 1)',
        },
        {
            array: [0, 0.1, 0.05],
            expected: false,
            title: 'not ordered asc then desc (case 2)',
        },
        {
            array: [0, 1, 2, 3, 4, 4, 5, 6, 5, 4, 3, 2],
            expected: false,
            title: 'not ordered large array (case 1)',
        },
        {
            array: [0, 1, 2, 3, 4, 4, 5, 6, 5, 6, 7, 8],
            expected: false,
            title: 'not ordered large array (case 2)',
        },
        {
            array: [-0, -1, -2, -3, -4, -4, -5, -6, -5, -6, -7, -8],
            expected: false,
            title: 'not ordered large array (case 3)',
        },
        {
            array: [1, 2, NaN, 3],
            expected: false,
            title: 'wrong item (case 1)',
        },
        {
            array: [1, 2, 'three', 4],
            expected: false,
            title: 'wrong item (case 2)',
        },
        {
            array: [NaN],
            expected: false,
            title: 'wrong item (case 3)',
        },
        {
            array: [true],
            expected: false,
            title: 'wrong item (case 4)',
            withError: true,
        },
        {
            array: [null],
            expected: false,
            title: 'wrong item (case 5)',
            withError: true,
        },
        {
            array: [false],
            expected: false,
            title: 'wrong item (case 6)',
            withError: true,
        },
        {
            array: [false, 5],
            expected: false,
            title: 'wrong item (case 7)',
            withError: true,
        },
        {
            array: ['hello'],
            expected: false,
            title: 'wrong item (case 8)',
        },
        {
            array: undefined,
            expected: false,
            title: 'no array',
        },
        {
            array: {},
            expected: false,
            title: 'empty object',
        },
        {
            array: { length: 1 },
            expected: false,
            title: 'wrong object',
        },
    ])('areNumbersOrdered $title', ({ array, expected, withError }) => {
        expect(areNumbersOrdered(array)).toBe(expected);
        if (withError) {
            expect(error).toHaveBeenCalled();
        } else {
            expect(error).not.toHaveBeenCalled();
        }
    });
});
