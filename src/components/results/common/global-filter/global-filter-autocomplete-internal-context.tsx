/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { FilterType } from '../utils';

type GlobalFilterAutocompleteInternalContextType = {
    openedDropdown: boolean;
    setOpenedDropdown: (open: boolean) => void;
    directoryItemSelectorOpen: boolean;
    setDirectoryItemSelectorOpen: (open: boolean) => void;
    filterGroupSelected: string;
    setFilterGroupSelected: (selectedFilterGroup: string) => void;
};

const GlobalFilterAutocompleteInternalContext = createContext<GlobalFilterAutocompleteInternalContextType | null>(null);

export function GlobalFilterAutocompleteInternalProvider({ children }: Readonly<PropsWithChildren>) {
    const [openedDropdown, setOpenedDropdown] = useState(false);
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] = useState(false);
    const [filterGroupSelected, setFilterGroupSelected] = useState<string>(FilterType.VOLTAGE_LEVEL);

    const value = useMemo(
        () => ({
            openedDropdown,
            setOpenedDropdown,
            directoryItemSelectorOpen,
            setDirectoryItemSelectorOpen,
            filterGroupSelected,
            setFilterGroupSelected,
        }),
        [directoryItemSelectorOpen, filterGroupSelected, openedDropdown]
    );

    return (
        <GlobalFilterAutocompleteInternalContext.Provider value={value}>
            {children}
        </GlobalFilterAutocompleteInternalContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGlobalFilterAutocompleteInternalContext() {
    const context = useContext(GlobalFilterAutocompleteInternalContext);
    if (!context) {
        throw new Error(
            'useGlobalFilterAutocompleteInternalContext must be used inside GlobalFilterAutocompleteInternalProvider'
        );
    }
    return context;
}
