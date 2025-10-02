/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext } from 'react';
import type { GlobalFilter } from './types';

export const GlobalFilterContext = createContext<{
    // manage internal states
    openedDropdown: boolean;
    setOpenedDropdown: (open: boolean) => void;
    directoryItemSelectorOpen: boolean;
    setDirectoryItemSelectorOpen: (open: boolean) => void;
    filterGroupSelected?: string;
    setFilterGroupSelected: (selectedFilterGroup: string) => void;
    selectedGlobalFilters: GlobalFilter[];
    setSelectedGlobalFilters: (selectedGlobalFilters: GlobalFilter[]) => void;
    // callback to communicate to parent component
    onChange: (globalFilters: GlobalFilter[]) => void;
    filterCategories: string[];
    genericFiltersStrictMode: boolean;
    equipmentTypes: string[] | undefined;
}>({
    openedDropdown: false,
    setOpenedDropdown: () => {},
    directoryItemSelectorOpen: false,
    setDirectoryItemSelectorOpen: () => {},
    filterGroupSelected: undefined,
    setFilterGroupSelected: () => {},
    selectedGlobalFilters: [],
    setSelectedGlobalFilters: () => {},
    onChange: () => {},
    filterCategories: [],
    genericFiltersStrictMode: false,
    equipmentTypes: undefined,
});
