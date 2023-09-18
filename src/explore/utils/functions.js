/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * function to generate a key
 * @returns {number} key
 */
export function keyGenerator() {
    let key = 1;
    return () => key++;
}

export const areArrayElementsUnique = (array) => {
    let uniqueValues = [...new Set(array)];
    return uniqueValues.length === array.length;
};

export const mergeSx = (...allSx) => allSx.flat();

export const isObjectEmpty = (object) =>
    object && Object.keys(object).length === 0;
