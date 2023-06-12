/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

const removeElementFromArrayWithFieldValue = (
    arrayToRemoveFieldValueFrom,
    fieldValueToRemove
) => {
    return arrayToRemoveFieldValueFrom.filter(
        (f) => f.field !== fieldValueToRemove
    );
};

const changeValueFromArrayWithFieldValue = (
    arrayToModify,
    fieldValue,
    newValue
) => {
    const filterIndex = arrayToModify.findIndex((f) => f.field === fieldValue);
    if (filterIndex === -1) {
        return [
            ...arrayToModify,
            {
                field: fieldValue,
                value: newValue,
            },
        ];
    } else {
        const updatedArray = [...arrayToModify];
        updatedArray[filterIndex].value = newValue;
        return updatedArray;
    }
};

export const useRowFilter = (filterSelectorKeys) => {
    const [rowFilters, setRowFilters] = useState([]);

    const updateFilter = useCallback((field, value) => {
        setRowFilters((oldRowFilters) => {
            let updatedFilters;

            if (!value?.length) {
                updatedFilters = removeElementFromArrayWithFieldValue(
                    oldRowFilters,
                    field
                );
            } else {
                updatedFilters = changeValueFromArrayWithFieldValue(
                    oldRowFilters,
                    field,
                    value
                );
            }

            return updatedFilters;
        });
    }, []);

    const getFilterSelector = useCallback(() => {
        return rowFilters.reduce((selector, { field, value }) => {
            selector[filterSelectorKeys[field]] = [value];
            return selector;
        }, {});
    }, [filterSelectorKeys, rowFilters]);

    const initFilters = useCallback(() => {
        setRowFilters([]);
    }, []);

    return { updateFilter, getFilterSelector, initFilters };
};
