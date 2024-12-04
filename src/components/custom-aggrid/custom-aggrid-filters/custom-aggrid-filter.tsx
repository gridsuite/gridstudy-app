/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, MouseEvent, useMemo, useState } from 'react';
import { Popover } from '@mui/material';
import { CustomAggridAutocompleteFilter } from './custom-aggrid-autocomplete-filter';
import CustomAggridBooleanFilter from './custom-aggrid-boolean-filter';
import { CustomHeaderFilterParams, FILTER_DATA_TYPES } from '../custom-aggrid-header.type';
import { CustomFilterIcon } from './custom-filter-icon';
import { CustomAggridComparatorFilter } from './custom-aggrid-comparator-filter';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';
import { isStringOrNonEmptyArray } from '../custom-aggrid-header-utils';

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
    filterParams: CustomHeaderFilterParams;
    handleCloseFilter: () => void;
    isHoveringColumnHeader: boolean;
}

const enum FilterTypes {
    'BOOLEAN',
    'AUTOCOMPLETE',
    'COMPARATOR',
}

export const CustomAggridFilter: FunctionComponent<CustomAggridFilterWrapperProps> = ({
    field,
    filterParams,
    handleCloseFilter,
    isHoveringColumnHeader,
}) => {
    const [filterAnchorElement, setFilterAnchorElement] = useState<HTMLElement | null>(null);
    const { selectedFilterData } = useCustomAggridFilter(field, filterParams);

    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        filterOptions = [], // used for autoComplete filter as a UI type (list of possible filters)he value is a duration, we need to handle that special case, because it's a number filter but with text input
        isFilterable = false,
        forceDisplayFilterIcon = false,
    } = filterParams;

    const filterType = useMemo(() => {
        if (filterDataType === FILTER_DATA_TYPES.BOOLEAN) {
            return FilterTypes.BOOLEAN;
        }
        if (filterDataType === FILTER_DATA_TYPES.TEXT && filterOptions?.length) {
            return FilterTypes.AUTOCOMPLETE;
        }
        return FilterTypes.COMPARATOR;
    }, [filterDataType, filterOptions]);

    const CustomFilter = useMemo(() => {
        switch (filterType) {
            case FilterTypes.BOOLEAN:
                return CustomAggridBooleanFilter;
            case FilterTypes.AUTOCOMPLETE:
                return CustomAggridAutocompleteFilter;
            case FilterTypes.COMPARATOR:
            default:
                return CustomAggridComparatorFilter;
        }
    }, [filterType]);

    /* Filter should be activated for current column and
  Filter dataType should be defined and
  filter is an autocomplete (have options) or filter have comparators */
    const shouldActivateFilter =
        isFilterable &&
        !!filterDataType &&
        ([FilterTypes.AUTOCOMPLETE, FilterTypes.BOOLEAN].includes(filterType) || !!filterComparators.length);

    const shouldDisplayFilterIcon =
        forceDisplayFilterIcon ||
        isHoveringColumnHeader || // user is hovering column header
        isStringOrNonEmptyArray(selectedFilterData) || // user filtered data on current column
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
                {shouldDisplayFilterIcon && (
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
                        paper: { sx: styles[filterType === FilterTypes.AUTOCOMPLETE ? 'autoCompleteInput' : 'input'] },
                    }}
                >
                    <CustomFilter field={field} filterParams={filterParams} />
                </Popover>
            </>
        )
    );
};
