/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, MouseEvent, useState } from 'react';
import { Popover } from '@mui/material';
import { CustomAggridAutocompleteFilter } from './custom-aggrid-autocomplete-filter';
import CustomAggridBooleanFilter from './custom-aggrid-boolean-filter';
import { CustomHeaderFilterParams, FILTER_DATA_TYPES } from '../custom-aggrid-header.type';
import { CustomFilterIcon } from './custom-filter-icon';
import { CustomAggridComparatorFilter } from './custom-aggrid-comparator-filter';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';

const styles = {
    input: {
        minWidth: '250px',
        maxWidth: '40%',
    },
    autoCompleteInput: {
        width: '30%',
    },
};

interface CustomAggridFilterWrapperProps {
    field: string;
    handleCloseFilter: () => void;
    getEnumLabel: (value: string) => string | undefined;
    filterParams: CustomHeaderFilterParams;
    isCountry: boolean;
    isFilterable: boolean;
    isHoveringColumnHeader: boolean;
    forceDisplayFilterIcon: boolean;
}

export const CustomAggridFilter: FunctionComponent<CustomAggridFilterWrapperProps> = ({
    field,
    handleCloseFilter,
    getEnumLabel,
    filterParams,
    isCountry,
    isFilterable,
    isHoveringColumnHeader,
    forceDisplayFilterIcon,
}) => {
    const [filterAnchorElement, setFilterAnchorElement] = useState<HTMLElement | null>(null);

    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        filterOptions = [], // used for autoComplete filter as a UI type (list of possible filters)he value is a duration, we need to handle that special case, because it's a number filter but with text input
    } = filterParams;

    const { selectedFilterData, autocompleteFilterParams, booleanFilterParams } = useCustomAggridFilter(
        field,
        filterParams
    );
    const { handleFilterAutoCompleteChange } = autocompleteFilterParams;
    const { handleSelectedFilterDataChange } = booleanFilterParams;

    const isBooleanFilter = filterDataType === FILTER_DATA_TYPES.BOOLEAN;
    const isAutoCompleteFilter = filterDataType === FILTER_DATA_TYPES.TEXT && !!filterOptions?.length;
    const isComparatorFilter = !isBooleanFilter && !isAutoCompleteFilter;

    /* Filter should be activated for current column and
    Filter dataType should be defined and
    filter is an autocomplete (have options) or filter have comparators */
    const shouldActivateFilter =
        isFilterable && !!filterDataType && (isAutoCompleteFilter || !!filterComparators.length || isBooleanFilter);

    const shouldDisplayFilterIcon =
        isHoveringColumnHeader || // user is hovering column header
        !!selectedFilterData?.length || // user filtered data on current column
        !!filterAnchorElement; // filter popped-over but user is not hovering current column header

    const handleShowFilter = (event: MouseEvent<HTMLElement>) => {
        setFilterAnchorElement(event.currentTarget);
    };

    const onClose = () => {
        handleCloseFilter();
        setFilterAnchorElement(null);
    };

    return (
        shouldActivateFilter && (
            <>
                {(forceDisplayFilterIcon || shouldDisplayFilterIcon) && (
                    <CustomFilterIcon selectedFilterData={selectedFilterData} handleShowFilter={handleShowFilter} />
                )}
                <Popover
                    id={`${field}-filter-popover`}
                    open={!!filterAnchorElement}
                    anchorEl={filterAnchorElement}
                    onClose={onClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    slotProps={{
                        paper: { sx: styles[isAutoCompleteFilter ? 'autoCompleteInput' : 'input'] },
                    }}
                >
                    {isAutoCompleteFilter && (
                        <CustomAggridAutocompleteFilter
                            value={selectedFilterData}
                            filterParams={filterParams}
                            getEnumLabel={getEnumLabel}
                            onChange={handleFilterAutoCompleteChange}
                            isCountry={isCountry}
                        />
                    )}
                    {isBooleanFilter && (
                        <CustomAggridBooleanFilter
                            value={selectedFilterData}
                            onChange={handleSelectedFilterDataChange}
                        />
                    )}
                    {isComparatorFilter && <CustomAggridComparatorFilter field={field} filterParams={filterParams} />}
                </Popover>
            </>
        )
    );
};
