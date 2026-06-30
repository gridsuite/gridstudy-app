/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { GlobalFilterContext } from './global-filter-context';
import { GlobalFilterContextValue, ReusableGlobalFilterProviderProps } from './global-filter-context-types';

export default function GlobalFilterContextProvider({
    children,
    globalFilterOptions,
    selectedGlobalFilters,
    recentGlobalFilters,
    filterCategories,
    genericFiltersStrictMode,
    filterableEquipmentTypes,
    selectGlobalFilter,
    unselectGlobalFilters,
    clearSelectedGlobalFilters,
    addGlobalFilterOptions,
    removeGlobalFilterOption,
}: Readonly<ReusableGlobalFilterProviderProps>) {
    const value = useMemo<GlobalFilterContextValue>(
        () => ({
            globalFilterOptions,
            selectedGlobalFilters,
            recentGlobalFilters,
            filterCategories,
            genericFiltersStrictMode,
            filterableEquipmentTypes,
            selectGlobalFilter,
            unselectGlobalFilters,
            clearSelectedGlobalFilters,
            addGlobalFilterOptions,
            removeGlobalFilterOption,
        }),
        [
            globalFilterOptions,
            selectedGlobalFilters,
            recentGlobalFilters,
            filterCategories,
            genericFiltersStrictMode,
            filterableEquipmentTypes,
            selectGlobalFilter,
            unselectGlobalFilters,
            clearSelectedGlobalFilters,
            addGlobalFilterOptions,
            removeGlobalFilterOption,
        ]
    );

    return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}
