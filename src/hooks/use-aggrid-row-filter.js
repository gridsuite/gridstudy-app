/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';

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
                filterType: newValue?.dataType,
            },
        ];
    } else {
        const updatedArray = [...arrayToModify];
        updatedArray[filterIndex].value = newValue;
        return updatedArray;
    }
};

export const useAggridRowFilter = (
    filterSelectorKeys,
    updateFilterCallback = () => {}
) => {
    const [rowFilters, setRowFilters] = useState([]);

    const updateFilter = useCallback(
        (field, value) => {
            setRowFilters((oldRowFilters) => {
                let updatedFilters;

                if (
                    !value?.length ||
                    (typeof value?.[0] === 'object' && !value[0].text)
                ) {
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

                updateFilterCallback();

                return updatedFilters;
            });
        },
        [updateFilterCallback]
    );

    const filterSelector = useMemo(() => {
        const result = rowFilters.reduce((selector, { field, value }) => {
            selector[filterSelectorKeys[field]] = value;
            return selector;
        }, {});

        if (Object.keys(result).length === 0) {
            return null;
        }

        return result;
    }, [filterSelectorKeys, rowFilters]);

    const initFilters = useCallback(() => {
        setRowFilters([]);
    }, []);

    return { updateFilter, filterSelector, initFilters };
};
