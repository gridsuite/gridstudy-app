/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CustomAggridComparatorSelector } from './custom-aggrid-comparator-selector';
import { CustomAggridTextFilter } from './custom-aggrid-text-filter';
import { Grid } from '@mui/material';
import { useCustomAggridComparatorFilter } from './hooks/use-custom-aggrid-comparator-filter';

import { CustomAggridFilterParams } from './custom-aggrid-filter.type';

export const CustomAggridComparatorFilter = ({ api, colId, filterParams }: CustomAggridFilterParams) => {
    const {
        selectedFilterData,
        selectedFilterComparator,
        decimalAfterDot,
        isNumberInput,
        handleFilterComparatorChange,
        handleFilterTextChange,
        handleClearFilter,
    } = useCustomAggridComparatorFilter(api, colId, filterParams);

    const {
        comparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
    } = filterParams;

    return (
        <Grid container direction={'column'} gap={0.8} sx={{ padding: '8px' }}>
            <CustomAggridComparatorSelector
                value={selectedFilterComparator}
                onChange={handleFilterComparatorChange}
                options={comparators}
            />
            <CustomAggridTextFilter
                value={selectedFilterData}
                onChange={handleFilterTextChange}
                onClear={handleClearFilter}
                isNumberInput={isNumberInput}
                decimalAfterDot={decimalAfterDot}
            />
        </Grid>
    );
};
