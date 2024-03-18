/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomColDef, FILTER_DATA_TYPES } from './custom-aggrid-header.type';
import CustomHeaderComponent from './custom-aggrid-header';
import { FilterSelectorType } from 'hooks/use-aggrid-row-filter';

export const makeAgGridCustomHeaderColumn = ({
    sortProps, // sortProps: contains useAgGridSort params
    filterProps, // filterProps: contains useAgGridRowFilter params
    filterParams, // filterParams: Parameters for the column's filtering functionality
    filterTab,
    ...props // agGrid column props
}: CustomColDef) => {
    const { headerName, field = '', fractionDigits, numeric } = props;
    const { onSortChanged = () => {}, sortConfig } = sortProps || {};
    const { updateFilter, filterSelector } = filterProps || {};
    const { filterDataType, filterEnums = {} } = filterParams || {};

    const customFilterOptions =
        filterDataType === FILTER_DATA_TYPES.TEXT ? filterEnums[field] : [];

    const isSortable = !!sortProps;
    const isFilterable = !!filterProps;
    const isCurrentColumnSorted = sortConfig?.colKey === field;

    let minWidth = 75;
    if (isSortable && isCurrentColumnSorted) {
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
                onSortChanged: (newSortValue: number = 0) => {
                    onSortChanged(field, newSortValue);
                },
            },
            isFilterable,
            filterParams: {
                ...filterParams,
                filterSelector,
                customFilterOptions,
                updateFilter,
            },
            filterTab,
        },
        filterParams: props?.agGridFilterParams || undefined,
        ...props,
    };
};

export const mapFieldsToColumnsFilter = (
    filterSelector: FilterSelectorType[],
    columnToFieldMapping: Record<string, string>
) => {
    return filterSelector.map((filter) => ({
        ...filter,
        column: columnToFieldMapping[filter.column],
    }));
};
