/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { createContext, useContext, useState } from 'react';

export type FormulaSearchContextType = {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    searchResults: number[];
    setSearchResults: (value: number[]) => void;
    currentResultIndex: number;
    setCurrentResultIndex: (value: number) => void;
};

const FormulaSearchContext = createContext<FormulaSearchContextType | undefined>(undefined);

export const FormulaSearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);

    return (
        <FormulaSearchContext.Provider
            value={{
                searchTerm,
                setSearchTerm,
                searchResults,
                setSearchResults,
                currentResultIndex,
                setCurrentResultIndex,
            }}
        >
            {children}
        </FormulaSearchContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFormulaSearch = () => {
    const context = useContext(FormulaSearchContext);
    if (context === undefined) {
        throw new Error('useFormulaSearch must be used within a FormulaSearchProvider');
    }
    return context;
};
