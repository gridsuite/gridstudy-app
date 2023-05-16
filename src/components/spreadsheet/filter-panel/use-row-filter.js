import { useCallback, useState } from 'react';

const includesFilter = (value, filterValue) => {
    return value.includes(filterValue);
};

const filterValue = (filterType, value, filterValue) => {
    switch (filterType) {
        case 'select':
        case 'text':
            return includesFilter(value, filterValue);
        default:
            return true;
    }
};

const removeElementFromArrayWithFieldValue = (
    arrayToRemoveFieldValueFrom,
    fieldValueToRemove
) => {
    const elementToRemoveIndex = arrayToRemoveFieldValueFrom.findIndex(
        (f) => f.field === fieldValueToRemove
    );
    arrayToRemoveFieldValueFrom.splice(elementToRemoveIndex, 1);
    return arrayToRemoveFieldValueFrom;
};

const changeValueFromArrayWithFieldValue = (
    arrayToModify,
    fieldValue,
    newValue
) => {
    const filterIndex = arrayToModify.findIndex((f) => f.field === fieldValue);
    if (filterIndex === -1) {
        arrayToModify.push({
            field: fieldValue,
            value: newValue,
        });
    } else {
        arrayToModify[filterIndex].value = newValue;
    }
    return arrayToModify;
};

export const FILTER_TYPE = {
    SELECT: 'select',
    TEXT: 'text',
};

export const useRowFilter = (filtersDef) => {
    const [rowFilters, setRowFilters] = useState([]);

    const applyFilters = useCallback(
        (array, filters) => {
            return filters.reduce((result, filter) => {
                const filterType = filtersDef.find(
                    (filterDef) => filterDef.field === filter.field
                ).type;
                return result.filter((row) =>
                    filterValue(filterType, row?.[filter.field], filter?.value)
                );
            }, array);
        },
        [filtersDef]
    );

    const updateFilter = useCallback((field, value) => {
        if (value == null || value.length === 0) {
            setRowFilters((oldRowFilters) => {
                return [
                    ...removeElementFromArrayWithFieldValue(
                        oldRowFilters,
                        field
                    ),
                ];
            });
        } else {
            setRowFilters((oldRowFilters) => {
                return [
                    ...changeValueFromArrayWithFieldValue(
                        oldRowFilters,
                        field,
                        value
                    ),
                ];
            });
        }
    }, []);

    const filterResult = useCallback(
        (result) => {
            if (result == null) {
                return result;
            }

            return applyFilters(result, rowFilters);
        },
        [rowFilters, applyFilters]
    );

    return { filterResult, updateFilter };
};
