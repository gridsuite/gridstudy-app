/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Clear, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { useIntl } from 'react-intl';

interface QuickSearchProps {
    currentResultIndex: number;
    selectedReportId: string;
    onSearch: (searchTerm: string) => void;
    onNavigate: (direction: 'next' | 'previous') => void;
    resultCount: number;
    resetSearch: () => void;
}

const styles = {
    adornmentItem: {
        padding: '2px',
    },
};

export const QuickSearch: React.FC<QuickSearchProps> = ({
    currentResultIndex,
    selectedReportId,
    onSearch,
    onNavigate,
    resultCount,
    resetSearch,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [resultsCountDisplay, setResultsCountDisplay] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const intl = useIntl();

    const handleSearch = useCallback(() => {
        onSearch(searchTerm);
        setResultsCountDisplay(true);
    }, [searchTerm, onSearch]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' && searchTerm) {
                if (resultsCountDisplay && resultCount > 0) {
                    onNavigate('next');
                } else {
                    handleSearch();
                }
            }
        },
        [handleSearch, onNavigate, resultCount, resultsCountDisplay, searchTerm]
    );

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            if (value.length < searchTerm.length || value === '') {
                resetSearch();
                setResultsCountDisplay(false);
            }
            setSearchTerm(value);
            onSearch(value);
            if (value.length > 0) {
                setResultsCountDisplay(true);
            }
        },
        [onSearch, resetSearch, searchTerm.length]
    );

    const handleClear = useCallback(() => {
        setSearchTerm('');
        resetSearch();
        setResultsCountDisplay(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [resetSearch]);

    useEffect(() => {
        setSearchTerm('');
        setResultsCountDisplay(false);
    }, [selectedReportId]);

    return (
        <TextField
            inputRef={inputRef}
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage({ id: 'searchPlaceholderLog' })}
            sx={{ minWidth: '30%' }}
            size="small"
            InputProps={{
                endAdornment: (
                    <InputAdornment sx={{ padding: 0.2 }} position="end">
                        {searchTerm && (
                            <IconButton sx={styles.adornmentItem} onClick={handleClear}>
                                <Clear />
                            </IconButton>
                        )}
                        {resultsCountDisplay && (
                            <>
                                <Box sx={styles.adornmentItem}>
                                    <span>
                                        {currentResultIndex + 1}/{resultCount}
                                    </span>
                                </Box>
                                <Box>
                                    <IconButton
                                        sx={styles.adornmentItem}
                                        onClick={() => onNavigate('previous')}
                                        disabled={resultCount === 0}
                                    >
                                        <KeyboardArrowUp />
                                    </IconButton>
                                    <IconButton
                                        sx={styles.adornmentItem}
                                        onClick={() => onNavigate('next')}
                                        disabled={resultCount === 0}
                                    >
                                        <KeyboardArrowDown />
                                    </IconButton>
                                </Box>
                            </>
                        )}
                    </InputAdornment>
                ),
            }}
        />
    );
};
