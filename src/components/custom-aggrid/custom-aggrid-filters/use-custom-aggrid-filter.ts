import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
    FilterParams,
    FilterPropsType,
} from '../custom-aggrid-header.type';
import { ChangeEvent, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { debounce } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { computeTolerance } from '../../../hooks/use-aggrid-local-row-filter';
import { countDecimalPlaces } from '../../../utils/rounding';

export const useCustomAggridFilter = (field: string, filterParams: FilterParams & FilterPropsType) => {
    const [selectedFilterComparator, setSelectedFilterComparator] = useState('');
    const [decimalAfterDot, setDecimalAfterDot] = useState(0);
    const [selectedFilterData, setSelectedFilterData] = useState<any>();

    const { snackWarning } = useSnackMessage();

    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        debounceMs = 1000, // used to debounce the api call to not fetch the back end too fast
        filterSelector, // used to detect a tab change on the agGrid table
        updateFilter = () => {}, // used to update the filter and fetch the new data corresponding to the filter
        isDuration, // if the value is a duration, we need to handle that special case, because it's a number filter but with text input
    } = filterParams;

    const isNumberInput = filterDataType === FILTER_DATA_TYPES.NUMBER && !isDuration;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateFilter = useCallback(
        debounce((field, data) => updateFilter(field, data), debounceMs),
        [field, debounceMs, updateFilter]
    );
    const handleClearFilter = () => {
        setSelectedFilterData(undefined);
        updateFilter(field, {
            value: undefined,
            type: selectedFilterComparator,
            dataType: filterDataType,
            tolerance: undefined,
        });
    };

    const handleSelectedFilterDataChange = (data: string | string[]) => {
        setSelectedFilterData(data);
        debouncedUpdateFilter(field, {
            value: data,
            type: FILTER_TEXT_COMPARATORS.EQUALS,
            dataType: filterDataType,
            tolerance: isNumberInput ? computeTolerance(data) : undefined,
        });
    };

    const handleFilterAutoCompleteChange = (_: SyntheticEvent, data: string[]) => {
        handleSelectedFilterDataChange(data);
    };

    const handleFilterComparatorChange = (event: SelectChangeEvent) => {
        const newType = event.target.value;
        setSelectedFilterComparator(newType);
        debouncedUpdateFilter(field, {
            value: selectedFilterData,
            type: newType,
            dataType: filterDataType,
            tolerance: isNumberInput ? computeTolerance(selectedFilterData) : undefined,
        });
    };

    const handleFilterDurationChange = (value?: string) => {
        setSelectedFilterData(value);
        debouncedUpdateFilter(field, {
            value: value,
            type: selectedFilterComparator,
            dataType: FILTER_DATA_TYPES.NUMBER,
            tolerance: undefined,
        });
    };

    const handleFilterTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toUpperCase();
        setSelectedFilterData(value);

        debouncedUpdateFilter(field, {
            value: value,
            type: selectedFilterComparator,
            dataType: filterDataType,
            tolerance: isNumberInput ? computeTolerance(value) : undefined,
        });
        if (isNumberInput) {
            let decimalAfterDot = countDecimalPlaces(Number(value));
            if (decimalAfterDot >= 13) {
                snackWarning({
                    headerId: 'filter.warnRounding',
                });
            }
            setDecimalAfterDot(decimalAfterDot);
        }
    };

    useEffect(() => {
        if (!selectedFilterComparator) {
            setSelectedFilterComparator(filterComparators[0]);
        }
    }, [selectedFilterComparator, filterComparators]);

    useEffect(() => {
        if (!filterSelector?.length) {
            setSelectedFilterData(undefined);
        } else {
            const filterObject = filterSelector?.find((filter) => filter.column === field);
            if (filterObject) {
                setSelectedFilterData(filterObject.value);
                setSelectedFilterComparator(filterObject.type);
            } else {
                setSelectedFilterData(undefined);
            }
        }
    }, [filterSelector, field]);

    return {
        selectedFilterData,
        comparatorFilterParams: {
            selectedFilterComparator,
            filterComparators,
            decimalAfterDot,
            isNumberInput,
            handleFilterComparatorChange,
            handleFilterDurationChange,
            handleFilterTextChange,
            handleClearFilter,
        },
        autocompleteFilterParams: {
            handleFilterAutoCompleteChange,
        },
        booleanFilterParams: {
            handleSelectedFilterDataChange,
        },
    };
};
