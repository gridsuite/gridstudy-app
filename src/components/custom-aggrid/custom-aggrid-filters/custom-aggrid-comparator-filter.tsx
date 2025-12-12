/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CustomAggridComparatorSelector } from './custom-aggrid-comparator-selector';
import { CustomAggridTextFilter } from './custom-aggrid-text-filter';
import { Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useCustomAggridComparatorFilter } from './hooks/use-custom-aggrid-comparator-filter';

import { CustomAggridFilterParams, FILTER_TEXT_COMPARATORS } from './custom-aggrid-filter.type';

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

    const isComparatorWithoutValue =
        selectedFilterComparator === FILTER_TEXT_COMPARATORS.IS_EMPTY ||
        selectedFilterComparator === FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY;

    return (
        <Grid container direction={'column'} gap={0.8} sx={{ padding: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ flex: 1 }}>
                    <CustomAggridComparatorSelector
                        value={selectedFilterComparator}
                        onChange={handleFilterComparatorChange}
                        options={comparators}
                    />
                </div>
                {/* we add a close icon to clear the comparator IS_EMPTY or IS_NOT_EMPTY */}
                {isComparatorWithoutValue && selectedFilterData !== undefined && (
                    <IconButton size="small" onClick={handleClearFilter}>
                        <CloseIcon />
                    </IconButton>
                )}
            </div>
            {!isComparatorWithoutValue && (
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
