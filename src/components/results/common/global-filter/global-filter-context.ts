/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { GlobalFilter, RecentGlobalFilter } from './global-filter-types';

export type GlobalFilterContextType = {
    globalFilterOptions: GlobalFilter[];
    selectedGlobalFilters: GlobalFilter[];
    recentGlobalFilters: RecentGlobalFilter[];
    filterCategories: string[];
    genericFiltersStrictMode: boolean;
    filterableEquipmentTypes: string[];
    selectGlobalFilter: (id: string) => void;
    unselectGlobalFilters: (ids: string[]) => void;
    clearSelectedGlobalFilters: () => void;
    addGlobalFilterOptions: (newFilters: GlobalFilter[]) => void;
    removeGlobalFilterOption: (id: string) => void;
};

export const GlobalFilterContext = createContext<GlobalFilterContextType | null>(null);

export function useGlobalFilterContext() {
    const context = useContext(GlobalFilterContext);
    if (!context) {
        throw new Error('useGlobalFilterContext must be used inside GlobalFilterProvider');
    }
    return context;
}
