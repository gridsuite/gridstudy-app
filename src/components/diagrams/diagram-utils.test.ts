/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeDiagramSorter } from './diagram-utils';

test('diagram-common.sortDiagrams', () => {
    const diagramStates = [{ id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }, { id: 0 }];

    const table = [
        {},
        null,
        { id: 1, align: 'right' },
        { id: 2, align: 'left' },
        { id: 3, align: 'left' },
        { id: 4, align: 'right' },
        { id: 0, align: 'hello world' },
    ].sort(makeDiagramSorter(diagramStates));

    expect(table.length).toBe(7);
    expect(table[0]!.align).toBe('left');
    expect(table[0]!.id).toBe(3);
    expect(table[1]!.align).toBe('left');
    expect(table[1]!.id).toBe(2);
    expect(table[2]!.align).toBe('right');
    expect(table[2]!.id).toBe(4);
    expect(table[3]!.align).toBe('right');
    expect(table[3]!.id).toBe(1);
    expect(table[4]?.align).not.toBe('left');
    expect(table[4]?.align).not.toBe('right');
    expect(table[5]?.align).not.toBe('left');
    expect(table[5]?.align).not.toBe('right');
    expect(table[6]?.align).not.toBe('left');
    expect(table[6]?.align).not.toBe('right');
});

test('diagram-common.sortDiagrams.missingAligns', () => {
    const diagramStates = [
        { id: 4 }, // align: undefined  => "first undefined"
        { id: 3 }, // align: LEFT       => "first left"
        { id: 2 }, // align: LEFT       => "second left"
        { id: 1 }, // align: RIGHT      => "right"
        { id: 0 }, // align: LEFT       => "third left"
        { id: 5 }, // align: undefined  => "second undefined"
    ];

    const table = [
        { id: 1, align: 'right', name: 'right' },
        { id: 2, align: 'left', name: 'second left' },
        { id: 3, align: 'left', name: 'first left' },
        { id: 5, name: 'second undefined' },
        { id: 4, name: 'first undefined' },
        { id: 0, align: 'left', name: 'third left' },
    ].sort(makeDiagramSorter(diagramStates));

    expect(table[0].name).toBe('first left');
    expect(table[1].name).toBe('second left');
    expect(table[2].name).toBe('third left');
    expect(table[3].name).toBe('right');
    expect(table[4].name).toBe('first undefined');
    expect(table[5].name).toBe('second undefined');
});
