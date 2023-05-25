/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const innerSortByAlign = (align) => {
    if (align === 'left') {
        return 10;
    }
    if (align === 'right') {
        return 20;
    }
    return 30;
};

/*
 * Sorts by the object's "align" parameter. Values equal to "left" will be before "right" values, and others or undefined will be last.
 */
export const sortByAlign = (a, b) => {
    return innerSortByAlign(a && a.align) - innerSortByAlign(b && b.align);
};

/*
 * Sort by the order of the objects inside diagramStates.
 */
export const sortByIndex = (a, b, diagramStates) => {
    return (
        diagramStates.findIndex((diagramState) => diagramState.id === a.id) -
        diagramStates.findIndex((diagramState) => diagramState.id === b.id)
    );
};

export const sortDiagrams = (diagramStates) => {
    return (a, b) => {
        if (a.align !== b.align) {
            return sortByAlign(a, b);
        } else {
            return sortByIndex(a, b, diagramStates);
        }
    };
};
