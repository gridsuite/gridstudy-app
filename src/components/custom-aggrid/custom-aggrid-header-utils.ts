/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomColDef,
    FilterSelectorType,
    FILTER_DATA_TYPES,
} from './custom-aggrid-header.type';
import CustomHeaderComponent from './custom-aggrid-header';
import { SortWay } from 'hooks/use-aggrid-sort';

export const makeAgGridCustomHeaderColumn = ({
    sortProps, // sortProps: contains useAgGridSort params
    filterProps, // filterProps: contains useAgGridRowFilter params
    filterParams, // filterParams: Parameters for the column's filtering functionality
    filterTab,
    ...props // agGrid column props
}: CustomColDef) => {
    const { headerName, field = '', fractionDigits, numeric } = props;
    const { onSortChanged = () => {}, sortConfig, children } = sortProps || {};
    const { updateFilter, filterSelector } = filterProps || {};
    const { filterDataType, filterEnums = {} } = filterParams || {};

    const customFilterOptions =
        filterDataType === FILTER_DATA_TYPES.TEXT ? filterEnums[field] : [];

    const isSortable = !!sortProps;
    const isFilterable = !!filterProps;
    const isCurrentColumnSorted = !!sortConfig?.find(
        (value) => value.colId === field
    );

    let minWidth = 75;
    if (isSortable && isCurrentColumnSorted) {
        minWidth += 30;
    }
    if (isFilterable) {
        minWidth += 30;
    }

    console.log('test isCurrentColumnSorted', field, isCurrentColumnSorted);
    console.log('test sortConfig', sortConfig);
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
                onSortChanged: (newSortValue: SortWay) => {
                    onSortChanged({
                        colId: field,
                        sort: newSortValue,
                        children: children,
                    });
                },
            },
            isFilterable,
            filterParams: {
                ...filterParams,
                filterSelector,
                customFilterOptions,
                updateFilter,
            },
            getEnumLabel: props?.getEnumLabel,
            isCountry: props?.isCountry,
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

export enum BooleanFilterValue {
    TRUE = 'true',
    FALSE = 'false',
    UNDEFINED = 'undefinedValue',
}
