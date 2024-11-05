/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Search, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { useIntl } from 'react-intl';

interface QuickSearchProps {
    currentResultIndex: number;
    selectedReportId: string;
    onSearch: (searchTerm: string) => void;
    onNavigate: (direction: 'next' | 'previous') => void;
    resultCount: number;
    setSearchResults: (results: number[]) => void;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
    currentResultIndex,
    selectedReportId,
    onSearch,
    onNavigate,
    resultCount,
    setSearchResults,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [resultsCountDisplay, setResultsCountDisplay] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const intl = useIntl();

    const handleSearch = useCallback(() => {
        onSearch(searchTerm);
    }, [searchTerm, onSearch]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' && searchTerm) {
                setResultsCountDisplay(true);
                handleSearch();
            }
        },
        [handleSearch, searchTerm]
    );

    const onChange = useCallback(
        (value: string) => {
            if (value.length < searchTerm.length || value === '') {
                setSearchResults([]);
            }
            setSearchTerm(value);
            setResultsCountDisplay(false);
        },
        [searchTerm.length, setSearchResults]
    );

    useEffect(() => {
        setSearchTerm('');
        setResultsCountDisplay(false);
    }, [selectedReportId]);

    return (
        <TextField
            inputRef={inputRef}
            value={searchTerm}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage({ id: 'searchPlaceholder' })}
            sx={{ width: '30%' }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search />
                    </InputAdornment>
                ),
                endAdornment: resultsCountDisplay && (
                    <InputAdornment sx={{ marginLeft: '50px' }} position="end">
                        <span>
                            {currentResultIndex + 1 + '/' + resultCount + ' ' + intl.formatMessage({ id: 'Results' })}
                        </span>

                        <Box sx={{ marginLeft: '20px' }}>
                            <IconButton
                                sx={{ padding: '2px' }}
                                onClick={() => onNavigate('previous')}
                                disabled={resultCount === 0}
                            >
                                <KeyboardArrowUp />
                            </IconButton>
                            <IconButton
                                sx={{ padding: '2px' }}
                                onClick={() => onNavigate('next')}
                                disabled={resultCount === 0}
                            >
                                <KeyboardArrowDown />
                            </IconButton>
                        </Box>
                    </InputAdornment>
                ),
            }}
        />
    );
};
