/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomColDef, FILTER_DATA_TYPES } from './custom-aggrid-header.type';
import CustomHeaderComponent from './custom-aggrid-header';
import { getPrimarySort, getSecondarySort } from '../../hooks/use-aggrid-sort';

export const makeAgGridCustomHeaderColumn = ({
    sortProps, // sortProps: contains useAgGridSort params
    filterProps, // filterProps: contains useAgGridRowFilter params
    filterParams, // filterParams: Parameters for the column's filtering functionality
    ...props // agGrid column props
}: CustomColDef) => {
    const {
        headerName,
        field = '',
        fractionDigits,
        numeric,
        secondarySort = false,
    } = props;
    const { onSortChanged = () => {}, sortConfig } = sortProps || {};
    const { updateFilter, filterSelector } = filterProps || {};
    const { filterDataType, filterEnums = {} } = filterParams || {};

    const filterOptions =
        filterDataType === FILTER_DATA_TYPES.TEXT ? filterEnums[field] : [];

    const isSortable = !!sortProps;
    const isFilterable = !!filterProps;
    const primarySortConfig =
        sortConfig !== undefined ? getPrimarySort(sortConfig) : undefined;
    const secondarySortConfig =
        sortConfig !== undefined ? getSecondarySort(sortConfig) : undefined;
    const isSorted = primarySortConfig?.colKey === field;
    const isSecondarySorted = secondarySortConfig?.colKey === field;

    let minWidth = 75;
    if (isSortable && (isSorted || isSecondarySorted)) {
        minWidth += 30;
    }
    if (isFilterable) {
        minWidth += 30;
    }

    return {
        headerTooltip: headerName,
        minWidth,
        fractionDigits: numeric && !fractionDigits ? 2 : fractionDigits,
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName: headerName,
            isSortable,
            sortParams: {
                sortConfig,
                onSortWayChanged: (newSortWayValue: number = 0) => {
                    onSortChanged(field, newSortWayValue, secondarySort);
                },
            },
            isFilterable,
            filterParams: {
                ...filterParams,
                filterSelector,
                filterOptions,
                updateFilter,
            },
        },
        ...props,
    };
};
