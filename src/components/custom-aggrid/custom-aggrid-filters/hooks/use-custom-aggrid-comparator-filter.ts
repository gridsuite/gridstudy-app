/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeEvent, useMemo } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { countDecimalPlacesFromString } from '../../../../utils/rounding';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';
import { GridApi } from 'ag-grid-community';
import { computeTolerance } from '../utils/filter-tolerance-utils';
import { FilterParams } from '../../../../types/custom-aggrid-types';
import { FILTER_DATA_TYPES } from '../custom-aggrid-filter.type';

export const useCustomAggridComparatorFilter = (api: GridApi, colId: string, filterParams: FilterParams) => {
    const { dataType = FILTER_DATA_TYPES.TEXT } = filterParams;

    const isNumberInput = dataType === FILTER_DATA_TYPES.NUMBER;

    const { selectedFilterData, selectedFilterComparator, handleChangeFilterValue, handleChangeComparator } =
        useCustomAggridFilter(api, colId, filterParams);

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
