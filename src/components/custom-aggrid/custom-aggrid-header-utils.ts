/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomColDef, FILTER_DATA_TYPES } from './custom-aggrid-header.type';
import CustomHeaderComponent from './custom-aggrid-header';

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
    const isCurrentColumnSorted = sortConfig?.colKey === field;
    const isColumnSecondarySorted = sortConfig?.secColKey === field;

    let minWidth = 75;
    if (isSortable && (isCurrentColumnSorted || isColumnSecondarySorted)) {
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
                    if (sortConfig !== undefined) {
                        if (secondarySort) {
                            // only the secondary sort changed
                            onSortChanged(
                                sortConfig.colKey,
                                sortConfig.sortWay,
                                field,
                                newSortValue
                            );
                        } else {
                            // only the primary sort changed
                            onSortChanged(
                                field,
                                newSortValue,
                                sortConfig.secColKey,
                                sortConfig.secSortWay
                            );
                        }
                    }
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
