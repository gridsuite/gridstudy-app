/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { RefObject, useCallback, useState } from 'react';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { Clear, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { type MuiStyles, type SxStyle, useDebounce } from '@gridsuite/commons-ui';

interface QuickSearchProps {
    currentResultIndex: number;
    onSearch: (searchTerm: string) => void;
    onNavigate: (direction: 'next' | 'previous') => void;
    resultCount: number;
    resetSearch: () => void;
    placeholder?: string;
    inputRef: RefObject<HTMLDivElement>;
    sx?: SxStyle;
}

const styles = {
    adornmentItem: {
        padding: '2px',
    },
} as const satisfies MuiStyles;

export const QuickSearch: React.FC<QuickSearchProps> = ({
    currentResultIndex,
    onSearch,
    onNavigate,
    resultCount,
    resetSearch,
    placeholder,
    inputRef,
    sx,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [resultsCountDisplay, setResultsCountDisplay] = useState(false);
    const intl = useIntl();
    const debounceSearch = useDebounce(onSearch, 300);

    const handleSearch = useCallback(() => {
        debounceSearch(searchTerm);
        setResultsCountDisplay(true);
    }, [searchTerm, debounceSearch]);

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
            if (value === '') {
                resetSearch();
                setResultsCountDisplay(false);
            }
            setSearchTerm(value);
            debounceSearch(value);
            if (value.length > 0) {
                setResultsCountDisplay(true);
            }
        },
        [debounceSearch, resetSearch]
    );

    const handleClear = useCallback(() => {
        setSearchTerm('');
        resetSearch();
        setResultsCountDisplay(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef, resetSearch]);

    return (
        <TextField
            inputRef={inputRef}
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ? intl.formatMessage({ id: placeholder }) : ''}
            sx={{ maxWidth: '500px', ...sx }}
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
