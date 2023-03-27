/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const innerSortByAlign = (align) => {
    if (align === 'left') return 10;
    if (align === 'right') return 20;
    return 30;
};

/*
 * Sorts by the object's "align" parameter. Values equal to "left" will be before "right" values, and others or undefined will be last.
 */
export const sortByAlign = (a, b) => {
    return innerSortByAlign(a && a.align) - innerSortByAlign(b && b.align);
};

/**
 * input : rows sorted by desired value
 * output : rows sorted by desired value, grouped by "idField" field
 * note : each row need a "linkedIdField" field
 */
export const groupPostSort = (sortedRows, idField, linkedIdField) => {
    const result = [];
    // get all id rows, they will form the groups parents
    const idRows = sortedRows.filter((row) => row.data[idField] != null);
    // for each of those groups ...
    idRows.forEach((idRow) => {
        //add group's parent to result first
        result.push(idRow);
        //then add all elements which belongs to this group
        result.push(
            ...sortedRows.filter(
                (row) => row.data[linkedIdField] === idRow.data[idField]
            )
        );
    });

    return result;
};
