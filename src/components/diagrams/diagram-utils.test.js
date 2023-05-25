/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { sortDiagrams } from './diagram-utils';

test('diagram-common.sortDiagrams', () => {
    const diagramStates = [
        { id: 4 },
        { id: 3 },
        { id: 2 },
        { id: 1 },
        { id: 0 },
    ];

    const table = [
        {},
        null,
        { id: 1, align: 'right' },
        { id: 2, align: 'left' },
        { id: 3, align: 'left' },
        { id: 4, align: 'right' },
        { id: 0, align: 'hello world' },
    ].sort(sortDiagrams(diagramStates));

    expect(table.length).toBe(7);
    expect(table[0].align).toBe('left');
    expect(table[0].id).toBe(3);
    expect(table[1].align).toBe('left');
    expect(table[1].id).toBe(2);
    expect(table[2].align).toBe('right');
    expect(table[2].id).toBe(4);
    expect(table[3].align).toBe('right');
    expect(table[3].id).toBe(1);
    expect(table[4]?.align).not.toBe('left');
    expect(table[4]?.align).not.toBe('right');
    expect(table[5]?.align).not.toBe('left');
    expect(table[5]?.align).not.toBe('right');
    expect(table[6]?.align).not.toBe('left');
    expect(table[6]?.align).not.toBe('right');
});
