import { createContext } from 'react';
import { GlobalFilter } from './global-filter-types';

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
});
