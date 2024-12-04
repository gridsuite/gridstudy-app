/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CustomAggridComparatorSelecter } from './custom-aggrid-comparator-selecter';
import CustomAggridDurationFilter from './custom-aggrid-duration-filter';
import CustomAggridTextFilter from './custom-aggrid-text-filter';
import { Grid } from '@mui/material';
import { CustomHeaderFilterParams } from '../custom-aggrid-header.type';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';

interface CustomAggridComparatorFilterProps {
    field: string;
    filterParams: CustomHeaderFilterParams;
}

export const CustomAggridComparatorFilter = ({ field, filterParams }: CustomAggridComparatorFilterProps) => {
    const { selectedFilterData, comparatorFilterParams } = useCustomAggridFilter(field, filterParams);
    const {
        selectedFilterComparator,
        filterComparators,
        decimalAfterDot,
        isNumberInput,
        handleFilterComparatorChange,
        handleFilterDurationChange,
        handleFilterTextChange,
        handleClearFilter,
    } = comparatorFilterParams;

    const { isDuration } = filterParams;

    return (
        <Grid container direction={'column'} gap={0.8} sx={{ padding: '8px' }}>
            <CustomAggridComparatorSelecter
                value={selectedFilterComparator}
                onChange={handleFilterComparatorChange}
                options={filterComparators}
            />

            {isDuration ? (
                <CustomAggridDurationFilter value={selectedFilterData} onChange={handleFilterDurationChange} />
            ) : (
                <CustomAggridTextFilter
                    value={selectedFilterData}
                    onChange={handleFilterTextChange}
                    onClear={handleClearFilter}
                    isNumberInput={isNumberInput}
                    decimalAfterDot={decimalAfterDot}
                />
            )}
        </Grid>
    );
};
