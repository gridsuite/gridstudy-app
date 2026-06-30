/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { GlobalFilterContext } from './global-filter-context';
import { GlobalFilterContextProviderProps, GlobalFilterContextValue } from './global-filter-context-types';

export default function GlobalFilterContextProvider({
    children,
    globalFilterOptions,
    selectedGlobalFilters,
    recentGlobalFilters,
    substationPropertiesGlobalFilters,
    filterCategories,
    genericFiltersStrictMode,
    filterableEquipmentTypes,
    translateCountryCode,
    selectGlobalFilter,
    unselectGlobalFilters,
    clearSelectedGlobalFilters,
    removeGlobalFilterOption,
    addFiltersToGlobalFiltersOptions,
}: Readonly<GlobalFilterContextProviderProps>) {
    const value = useMemo<GlobalFilterContextValue>(
        () => ({
            globalFilterOptions,
            selectedGlobalFilters,
            recentGlobalFilters,
            substationPropertiesGlobalFilters,
            filterCategories,
            genericFiltersStrictMode,
            filterableEquipmentTypes,
            translateCountryCode,
            selectGlobalFilter,
            unselectGlobalFilters,
            clearSelectedGlobalFilters,
            removeGlobalFilterOption,
            addFiltersToGlobalFiltersOptions,
        }),
        [
            globalFilterOptions,
            selectedGlobalFilters,
            recentGlobalFilters,
            substationPropertiesGlobalFilters,
            filterCategories,
            genericFiltersStrictMode,
            filterableEquipmentTypes,
            translateCountryCode,
            selectGlobalFilter,
            unselectGlobalFilters,
            clearSelectedGlobalFilters,
            removeGlobalFilterOption,
            addFiltersToGlobalFiltersOptions,
        ]
    );

    return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}
