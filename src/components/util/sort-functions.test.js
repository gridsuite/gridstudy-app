/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { sortByAlign } from './sort-functions';

test('sort-functions.sortByAlign', () => {
    const table = [
        {},
        null,
        { id: 1, align: 'right' },
        { id: 2, align: 'left' },
        { id: 3, align: 'left' },
        { id: 4, align: 'right' },
        { id: 5, align: 'hello world' },
    ].sort(sortByAlign);

    expect(table[0]?.align).toBe('left');
    expect(table[1]?.align).toBe('left');
    expect(table[2]?.align).toBe('right');
    expect(table[3]?.align).toBe('right');
    expect(table[4]?.align).not.toBe('left');
    expect(table[4]?.align).not.toBe('right');
    expect(table.length).toBe(7);
});
