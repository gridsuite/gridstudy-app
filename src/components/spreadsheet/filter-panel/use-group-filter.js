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

const groupBy = (array, key) => {
    return array.reduce(function (result, object) {
        result[object[key]] = result[object[key]] || [];
        result[object[key]].push(object);
        return result;
    }, Object.create(null));
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

export const FILTER_TARGET = {
    CHILD: 'child',
    PARENT: 'parent',
};

export const FILTER_TYPE = {
    SELECT: 'select',
    TEXT: 'text',
};

export const useGroupFilter = (filtersDef, linkKey) => {
    const [childrenFilters, setChildrenFilters] = useState([]);
    const [parentFilters, setParentFilters] = useState([]);

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

    const updateFilter = (field, value) => {
        const isParentFilter =
            filtersDef.find((filter) => field === filter.field).target ===
            FILTER_TARGET.PARENT;

        if (value == null || value.length === 0) {
            if (isParentFilter) {
                setParentFilters((oldParentFilters) => {
                    return [
                        ...removeElementFromArrayWithFieldValue(
                            oldParentFilters,
                            field
                        ),
                    ];
                });
            } else {
                setChildrenFilters((oldChildrenFilters) => {
                    return [
                        ...removeElementFromArrayWithFieldValue(
                            oldChildrenFilters,
                            field
                        ),
                    ];
                });
            }
        } else {
            if (isParentFilter) {
                setParentFilters((oldParentFilters) => {
                    return [
                        ...changeValueFromArrayWithFieldValue(
                            oldParentFilters,
                            field,
                            value
                        ),
                    ];
                });
            } else {
                setChildrenFilters((oldChildrenFilters) => {
                    return [
                        ...changeValueFromArrayWithFieldValue(
                            oldChildrenFilters,
                            field,
                            value
                        ),
                    ];
                });
            }
        }
    };

    const filterResult = useCallback(
        (result) => {
            if (result == null) {
                return result;
            }

            const childrenRows = result.filter((row) => row?.[linkKey] != null);

            const filteredChidrenRows = applyFilters(
                childrenRows,
                childrenFilters
            );

            const childrenRowsGroupedByParent = groupBy(
                filteredChidrenRows,
                linkKey
            );

            const parentRows = result.filter((row) => row?.[linkKey] == null);

            const filteredParentRows = applyFilters(parentRows, parentFilters);

            return filteredParentRows.reduce((result, currentParent) => {
                const childrenOfCurrentParent =
                    childrenRowsGroupedByParent[currentParent.elementId];
                if (childrenOfCurrentParent != null) {
                    result.push(currentParent);
                    return result.concat(childrenOfCurrentParent);
                }
                return result;
            }, []);
        },
        [parentFilters, childrenFilters, linkKey, applyFilters]
    );

    return { filterResult, updateFilter };
};
