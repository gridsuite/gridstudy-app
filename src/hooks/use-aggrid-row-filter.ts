/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FROM_COLUMN_TO_FIELD as SHORT_CIRCUIT_FIELDS } from 'components/results/shortcircuit/shortcircuit-analysis-result-content';
import { useCallback, useMemo, useState } from 'react';

type FilterDataType = { value: string; type: string; dataType: string };

type FilterType = {
    field: string;
    data: FilterDataType;
};

export type FilterEnumsType = Record<string, string[] | null>;

export type FilterSelectorType = {
    column: string;
    dataType: string;
    type: string;
    value: string;
};

export type FilterPropsType = {
    updateFilter: (field: string, value: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
    initFilters?: () => void;
};

type UseAggridRowFilterOutputType = {
    updateFilter: (field: string, data: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
    initFilters: () => void;
};

const removeElementFromArrayWithFieldValue = (
    filtersArrayToRemoveFieldValueFrom: FilterType[],
    field: string
) => {
    return filtersArrayToRemoveFieldValueFrom.filter(
        (f: FilterType) => f.field !== field
    );
};

const changeValueFromArrayWithFieldValue = (
    filtersArrayToModify: FilterType[],
    field: string,
    newData: FilterDataType
) => {
    const filterIndex = filtersArrayToModify.findIndex(
        (f: FilterType) => f.field === field
    );
    if (filterIndex === -1) {
        return [
            ...filtersArrayToModify,
            {
                field,
                data: newData,
            },
        ];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex].data = newData;
        return updatedArray;
    }
};

const kiloValues = [
    SHORT_CIRCUIT_FIELDS.limitMax,
    SHORT_CIRCUIT_FIELDS.limitMin,
];

export const useAggridRowFilter = (
    filterSelectorKeys: Record<string, string>,
    updateFilterCallback = () => {}
): UseAggridRowFilterOutputType => {
    const [filters, setFilters] = useState<FilterType[]>([]);

    const updateFilter = useCallback(
        (field: string, data: FilterDataType): void => {
            setFilters((oldRowFilters: FilterType[]) => {
                let updatedFilters;

                if (!data.value) {
                    updatedFilters = removeElementFromArrayWithFieldValue(
                        oldRowFilters,
                        field
                    );
                } else {
                    updatedFilters = changeValueFromArrayWithFieldValue(
                        oldRowFilters,
                        field,
                        data
                    );
                }

                updateFilterCallback();

                return updatedFilters;
            });
        },
        [updateFilterCallback]
    );

    const filterSelector: FilterSelectorType[] | null = useMemo(() => {
        const result = filters.reduce(
            (selector: Record<string, FilterDataType>, { field, data }) => {
                selector[filterSelectorKeys[field]] = data;
                return selector;
            },
            {}
        );

        const resultKeys = Object.keys(result);

        if (!resultKeys.length) {
            return null;
        }

        return resultKeys.map((field: string) => {
            const selectedValue = result[field];

            const { value, type, dataType } = selectedValue;

            let backendValue = value;

            if (dataType === 'number' && kiloValues.includes(field)) {
                backendValue = String(parseInt(value) * 1000);
            }

            return {
                column: field,
                dataType,
                type,
                value: backendValue,
            };
        });
    }, [filterSelectorKeys, filters]);

    const initFilters = useCallback(() => {
        setFilters([]);
    }, []);

    return { updateFilter, filterSelector, initFilters };
};
