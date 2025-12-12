/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { ComponentType, MouseEvent, useMemo, useState } from 'react';
import { Popover } from '@mui/material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { CustomFilterIcon } from './custom-filter-icon';
import { useCustomAggridFilter } from './hooks/use-custom-aggrid-filter';
import { CustomAggridAutocompleteFilterParams } from './custom-aggrid-autocomplete-filter';
import { CustomAggridFilterParams, FILTER_TEXT_COMPARATORS } from './custom-aggrid-filter.type';

const styles = {
    input: {
        minWidth: '250px',
        maxWidth: '40%',
    },
    autoCompleteInput: {
        width: '30%',
    },
} as const satisfies MuiStyles;

interface CustomAggridFilterWrapperParams<F extends CustomAggridFilterParams> {
    filterComponent: ComponentType<F>;
    filterComponentParams: F;
    isHoveringColumnHeader: boolean;
    forceDisplayFilterIcon: boolean;
    handleCloseFilter: () => void;
}

export const CustomAggridFilter = <F extends CustomAggridFilterParams>({
    filterComponent: FilterComponent,
    filterComponentParams,
    isHoveringColumnHeader,
    forceDisplayFilterIcon = false,
    handleCloseFilter,
}: CustomAggridFilterWrapperParams<F>) => {
    const [filterAnchorElement, setFilterAnchorElement] = useState<HTMLElement | null>(null);

    const { selectedFilterData, selectedFilterComparator } = useCustomAggridFilter(
        filterComponentParams.api,
        filterComponentParams.colId,
        filterComponentParams.filterParams
    );

    const handleShowFilter = (event: MouseEvent<HTMLElement>) => {
        setFilterAnchorElement(event.currentTarget);
    };

    const onClose = () => {
        handleCloseFilter();
        setFilterAnchorElement(null);
    };

    // a filter is active if it has data or if it's using IS_EMPTY or IS_NOT_EMPTY comparators
    const isFilterActive =
        (Array.isArray(selectedFilterData) ? selectedFilterData.length > 0 : !!selectedFilterData) ||
        selectedFilterComparator === FILTER_TEXT_COMPARATORS.IS_EMPTY ||
        selectedFilterComparator === FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY;

    const shouldDisplayFilterIcon = useMemo(
        () =>
            (!!FilterComponent && isHoveringColumnHeader) ||
            isFilterActive ||
            !!filterAnchorElement ||
            forceDisplayFilterIcon,
        [FilterComponent, filterAnchorElement, forceDisplayFilterIcon, isHoveringColumnHeader, isFilterActive]
    );

    return (
        <>
            {shouldDisplayFilterIcon && (
                <CustomFilterIcon
                    selectedFilterData={selectedFilterData}
                    selectedFilterComparator={selectedFilterComparator}
                    handleShowFilter={handleShowFilter}
                />
            )}
            <Popover
                id={`${filterComponentParams.colId}-filter-popover`}
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
                    paper: {
                        //Test for specific parameter presence to apply a style
                        sx: styles[
                            !!(filterComponentParams as unknown as CustomAggridAutocompleteFilterParams)?.options
                                ? 'autoCompleteInput'
                                : 'input'
                        ],
                    },
                }}
            >
                <FilterComponent {...filterComponentParams} />
            </Popover>
        </>
    );
};
