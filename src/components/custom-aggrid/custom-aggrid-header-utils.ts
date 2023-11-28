/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
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
    const { headerName, field = '' } = props;
    const { onSortChanged = () => {}, sortConfig } = sortProps || {};
    const { updateFilter, filterSelector } = filterProps || {};
    const { filterDataType, filterEnums = {} } = filterParams || {};

    const filterOptions =
        filterDataType === FILTER_DATA_TYPES.TEXT ? filterEnums[field] : [];

    return {
        headerTooltip: headerName,
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName: headerName,
            isSortable: !!sortProps,
            sortParams: {
                sortConfig,
                onSortChanged: (newSortValue: number = 0) => {
                    onSortChanged(field, newSortValue);
                },
            },
            isFilterable: !!filterProps,
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
