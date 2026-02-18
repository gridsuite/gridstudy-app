/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext } from 'react';
import { GlobalFilter } from './global-filter-types';
import { TableType } from '../../../../types/custom-aggrid-types';
import { FilterType } from '../utils';
import type { UUID } from 'node:crypto';

export const GlobalFilterContext = createContext<{
    // manage internal states
    openedDropdown: boolean;
    setOpenedDropdown: (open: boolean) => void;
    directoryItemSelectorOpen: boolean;
    setDirectoryItemSelectorOpen: (open: boolean) => void;
    filterGroupSelected?: string;
    setFilterGroupSelected: (selectedFilterGroup: string) => void;
    globalFilterOptions: GlobalFilter[];
    selectedGlobalFilters: GlobalFilter[];
    filterCategories: string[];
    genericFiltersStrictMode: boolean;
    filterableEquipmentTypes: string[];
    tableType: TableType;
    tableUuid: string;
}>({
    openedDropdown: false,
    setOpenedDropdown: () => {},
    directoryItemSelectorOpen: false,
    setDirectoryItemSelectorOpen: () => {},
    filterGroupSelected: undefined,
    setFilterGroupSelected: () => {},
    globalFilterOptions: [],
    selectedGlobalFilters: [],
    filterCategories: [],
    genericFiltersStrictMode: false,
    filterableEquipmentTypes: [],
    tableType: TableType.Loadflow,
    tableUuid: TableType.Loadflow,
});
