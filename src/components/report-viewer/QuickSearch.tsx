/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState, useCallback, useRef } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useIntl } from 'react-intl';

interface QuickSearchProps {
    onSearch: (searchTerm: string) => void;
    onNavigate: (direction: 'next' | 'previous') => void;
    resultCount: number;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ onSearch, onNavigate, resultCount }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const intl = useIntl();

    const handleSearch = useCallback(() => {
        onSearch(searchTerm);
    }, [searchTerm, onSearch]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        },
        [handleSearch]
    );

    return (
        <TextField
            inputRef={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage({ id: 'searchPlaceholder' })}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => onNavigate('previous')} disabled={resultCount === 0}>
                            <ArrowUpward />
                        </IconButton>
                        <IconButton onClick={() => onNavigate('next')} disabled={resultCount === 0}>
                            <ArrowDownward />
                        </IconButton>
                        {resultCount > 0 && <span>{resultCount + ' ' + intl.formatMessage({ id: 'Results' })}</span>}
                    </InputAdornment>
                ),
            }}
        />
    );
};
