/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CustomHeaderFilterParams, FILTER_DATA_TYPES } from '../custom-aggrid-header.type';
import { ChangeEvent, useMemo } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { computeTolerance } from '../../../hooks/use-aggrid-local-row-filter';
import { countDecimalPlaces } from '../../../utils/rounding';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';

export const useCustomAggridComparatorFilter = (field: string, filterParams: CustomHeaderFilterParams) => {
    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        isDuration, // if the value is a duration, we need to handle that special case, because it's a number filter but with text input
    } = filterParams;

    const isNumberInput = filterDataType === FILTER_DATA_TYPES.NUMBER && !isDuration;

    const { selectedFilterData, selectedFilterComparator, handleChangeFilterValue, handleChangeComparator } =
        useCustomAggridFilter(field, filterParams);

    const { snackWarning } = useSnackMessage();

    const handleFilterComparatorChange = (event: SelectChangeEvent) => {
        const newType = event.target.value;
        handleChangeComparator(newType);
    };

    const handleClearFilter = () => {
        handleChangeFilterValue({
            value: undefined,
            type: selectedFilterComparator,
            dataType: filterDataType,
        });
    };

    const handleFilterDurationChange = (value?: string) => {
        handleChangeFilterValue({
            value,
            type: selectedFilterComparator,
            dataType: FILTER_DATA_TYPES.NUMBER,
        });
    };

    const handleFilterTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toUpperCase();
        handleChangeFilterValue({
            value,
            dataType: filterDataType,
            tolerance: isNumberInput ? computeTolerance(value) : undefined,
        });
    };

    const decimalAfterDot = useMemo(() => {
        if (isNumberInput) {
            let decimalAfterDot = countDecimalPlaces(Number(selectedFilterData));
            if (decimalAfterDot >= 13) {
                snackWarning({
                    headerId: 'filter.warnRounding',
                });
            }
            return decimalAfterDot;
        }
        return 0;
    }, [isNumberInput, selectedFilterData, snackWarning]);

    return {
        selectedFilterData,
        selectedFilterComparator,
        decimalAfterDot,
        isNumberInput,
        handleFilterComparatorChange,
        handleFilterDurationChange,
        handleFilterTextChange,
        handleClearFilter,
    };
};
