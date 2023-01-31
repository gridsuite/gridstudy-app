/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getIn } from 'yup/lib/util/reach';

export const isFieldRequired = (fieldName, schema, values) => {
    const { schema: fieldSchema, parent: parentValues } =
        getIn(schema, fieldName, values) || {};

    return (
        fieldSchema.resolve({ parent: parentValues })?.exclusiveTests
            ?.required === true
    );

    //static way, not working when using "when" in schema, but does not need form values
    //return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
};

export const areArrayElementsUnique = (array) => {
    let uniqueAlphaValues = [...new Set(array)];
    return uniqueAlphaValues.length === array.length;
};

//TODO : this method needs to be fixed in a future PR
//all elements should be distinct, but this method can return true even if there are duplicates
export const areArrayElementsOrdered = (array) => {
    if (array.length <= 1) return true;
    if (array[0] === array[1]) {
        return false;
    } else if (array[0] < array[1]) {
        for (let index = 0; index < array.length - 1; index++) {
            if (array[index] >= array[index + 1]) {
                return false;
            }
        }
    } else if (array[0] > array[1]) {
        for (let index = 0; index < array.length - 1; index++) {
            if (array[index] <= array[index + 1]) {
                return false;
            }
        }
    }

    return true;
};
