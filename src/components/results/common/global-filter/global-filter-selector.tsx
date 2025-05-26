/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import GlobalFilterProvider from './global-filter-provider';
import GlobalFilterAutocomplete, { GlobalFilterAutocompleteProps } from './global-filter-autocomplete';
import { GlobalFilter } from './global-filter-types';
import { useMemo } from 'react';
import { FilterType } from '../utils';

export type GlobalFilterSelectorProps = GlobalFilterAutocompleteProps & {
    onChange: (globalFilters: GlobalFilter[]) => void;
    preloadedGlobalFilters?: GlobalFilter[];
    genericFiltersStrictMode?: boolean;
};
export default function GlobalFilterSelector({
    onChange,
    filterableEquipmentTypes,
    preloadedGlobalFilters,
    filters,
    //If this parameter is enabled, only generic filters of the same type as those provided in filterableEquipmentTypes will be available
    genericFiltersStrictMode = false,
}: Readonly<GlobalFilterSelectorProps>) {
    // Global filter autocomplete displayed categories are dynamically provided from the on hand filters, GENERIC_FILTER gets manually added
    const filterCategories = useMemo(() => {
        let categories: string[] = filters.map((filter) => filter.filterType);
        if (!categories.includes(FilterType.GENERIC_FILTER)) {
            categories.push(FilterType.GENERIC_FILTER);
        }
        return categories;
    }, [filters]);

    return (
        <GlobalFilterProvider
            onChange={onChange}
            filterCategories={filterCategories}
            preloadedGlobalFilters={preloadedGlobalFilters}
            genericFiltersStrictMode={genericFiltersStrictMode}
            equipmentTypes={filterableEquipmentTypes}
        >
            <GlobalFilterAutocomplete filters={filters} filterableEquipmentTypes={filterableEquipmentTypes} />
        </GlobalFilterProvider>
    );
}
