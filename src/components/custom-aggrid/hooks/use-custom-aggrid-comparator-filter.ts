/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FILTER_DATA_TYPES } from '../custom-aggrid-header.type';
import { ChangeEvent, useMemo } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { computeTolerance } from '../../../hooks/use-aggrid-local-row-filter';
import { countDecimalPlacesFromString } from '../../../utils/rounding';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';
import { FilterParams } from '../custom-aggrid-header.type';

export const useCustomAggridComparatorFilter = (field: string, filterParams: FilterParams) => {
    const { filterDataType = FILTER_DATA_TYPES.TEXT } = filterParams;

    const isNumberInput = filterDataType === FILTER_DATA_TYPES.NUMBER;

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
        });
    };
    const handleFilterTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toUpperCase();
        handleChangeFilterValue({
            value,
            tolerance: isNumberInput ? computeTolerance(value) : undefined,
        });
    };

    const decimalAfterDot = useMemo(() => {
        if (isNumberInput) {
            let decimalAfterDot: number = countDecimalPlacesFromString(String(selectedFilterData));
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
        handleFilterTextChange,
        handleClearFilter,
    };
};
