/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomAggridFilterParams, CustomColDef, FilterSelectorType } from './custom-aggrid-header.type';
import CustomHeaderComponent from './custom-aggrid-header';

export const makeAgGridCustomHeaderColumn = <F extends CustomAggridFilterParams = CustomAggridFilterParams>({
    context,
    ...props // agGrid column props
}: CustomColDef<any, any, F>) => {
    const {
        sortProps, // sortProps: contains useAgGridSort params
        forceDisplayFilterIcon,
        filterComponent,
        filterComponentParams,
        tabIndex,
        isCustomColumn,
        Menu,
        fractionDigits,
        numeric,
    } = context || {};
    const { colId, headerName, field = '' } = props;
    const { onSortChanged = () => {}, sortConfig } = sortProps || {};
    const isSortable = !!sortProps;
    const isCurrentColumnSorted = !!sortConfig?.find((value) => value.colId === field);

    let minWidth = 75;
    if (isSortable && isCurrentColumnSorted) {
        minWidth += 30;
    }
    if (!!filterComponent) {
        minWidth += 30;
    }

    return {
        headerTooltip: headerName,
        minWidth,
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            colId,
            field,
            displayName: headerName,
            sortParams: {
                isSortable,
                sortConfig,
                onSortChanged,
            },
            customMenuParams: {
                tabIndex: tabIndex,
                isCustomColumn: isCustomColumn,
                Menu: Menu,
            },
            forceDisplayFilterIcon: forceDisplayFilterIcon,
            filterComponent: filterComponent,
            filterComponentParams,
        },
        filterParams: context?.agGridFilterParams || undefined,
        ...props,
        context: {
            ...context,
            fractionDigits: numeric && !fractionDigits ? 2 : fractionDigits,
        },
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

export const isStringOrNonEmptyArray = (value: unknown): value is string | unknown[] => {
    if (typeof value === 'string' && value.length > 0) {
        return true;
    }
    return Array.isArray(value) && value.length > 0;
};
