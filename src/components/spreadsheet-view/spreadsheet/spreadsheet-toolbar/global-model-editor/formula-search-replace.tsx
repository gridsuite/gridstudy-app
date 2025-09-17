/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { useButtonWithTooltip } from '../../../../utils/inputs/input-hooks';
import { COLUMNS_MODEL, COLUMN_FORMULA } from './spreadsheet-model-global-editor.utils';
import { QuickSearch } from 'components/report-viewer/QuickSearch';
import { useFormulaSearch } from './formula-search-context';

export default function FormulaSearchReplace() {
    const intl = useIntl();
    const { getValues, setValue, setFocus } = useFormContext();
    const { searchTerm, setSearchTerm, searchResults, setSearchResults, currentResultIndex, setCurrentResultIndex } =
        useFormulaSearch();

    const [open, setOpen] = useState(false);
    const [replace, setReplace] = useState('');

    const handleOpen = useCallback(() => {
        setOpen(true);
        setCurrentResultIndex(-1);
    }, [setCurrentResultIndex]);

    const handleClose = useCallback(() => {
        setOpen(false);
        setReplace('');
        setSearchTerm('');
        setSearchResults([]);
        setCurrentResultIndex(-1);
    }, [setCurrentResultIndex, setReplace, setSearchResults, setSearchTerm]);

    const escapeRegExp = useCallback((value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), []);

    const escapedSearchTerm = useMemo(() => {
        if (!searchTerm) {
            return '';
        }

        return escapeRegExp(searchTerm);
    }, [escapeRegExp, searchTerm]);

    const searchRegex = useMemo(() => {
        if (!escapedSearchTerm) {
            return null;
        }

        return new RegExp(escapedSearchTerm, 'i');
    }, [escapedSearchTerm]);

    const replaceInFormula = useCallback(
        (formula: string) => {
            if (!escapedSearchTerm) {
                return formula;
            }

            const regex = new RegExp(escapedSearchTerm, 'gi');
            return formula.replace(regex, replace);
        },
        [escapedSearchTerm, replace]
    );

    const focusFormula = useCallback(
        (rowIndex: number) => {
            const columns = getValues(COLUMNS_MODEL) as any[];
            const formula = columns[rowIndex][COLUMN_FORMULA] || '';
            const fieldName = `${COLUMNS_MODEL}[${rowIndex}].${COLUMN_FORMULA}`;
            setFocus(fieldName);
            setTimeout(() => {
                const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                    `textarea[name="${fieldName}"], input[name="${fieldName}"]`
                );
                if (input && searchTerm) {
                    const index = formula.toLowerCase().indexOf(searchTerm.toLowerCase());
                    if (index >= 0) {
                        input.setSelectionRange(index, index + searchTerm.length);
                    }
                }
            });
        },
        [getValues, searchTerm, setFocus]
    );

    const performSearch = useCallback(
        (term: string) => {
            setSearchTerm(term);
            if (!term) {
                setSearchResults([]);
                setCurrentResultIndex(-1);
                return;
            }
            const columns = getValues(COLUMNS_MODEL) as any[];
            const matches: number[] = [];
            columns.forEach((column, idx) => {
                const formula = column[COLUMN_FORMULA] || '';
                if (formula.toLowerCase().includes(term.toLowerCase())) {
                    matches.push(idx);
                }
            });
            setSearchResults(matches);
            setCurrentResultIndex(matches.length > 0 ? 0 : -1);
            if (matches.length > 0) {
                focusFormula(matches[0]);
            }
        },
        [focusFormula, getValues, setCurrentResultIndex, setSearchResults, setSearchTerm]
    );

    const handleNavigate = useCallback(
        (direction: 'next' | 'previous') => {
            if (searchResults.length === 0) {
                return;
            }
            let newIndex = currentResultIndex + (direction === 'next' ? 1 : -1);
            if (newIndex >= searchResults.length) {
                newIndex = 0;
            }
            if (newIndex < 0) {
                newIndex = searchResults.length - 1;
            }
            setCurrentResultIndex(newIndex);
            focusFormula(searchResults[newIndex]);
        },
        [currentResultIndex, focusFormula, searchResults, setCurrentResultIndex]
    );

    const handleReplaceNext = () => {
        if (!searchTerm || !replace || searchResults.length === 0 || currentResultIndex < 0) {
            return;
        }
        const rowIndex = searchResults[currentResultIndex];
        const columns = getValues(COLUMNS_MODEL) as any[];
        const formula = columns[rowIndex][COLUMN_FORMULA] || '';
        const newFormula = replaceInFormula(formula);
        setValue(`${COLUMNS_MODEL}[${rowIndex}].${COLUMN_FORMULA}`, newFormula, { shouldDirty: true });
        performSearch(searchTerm);
    };

    const handleReplaceAll = () => {
        if (!searchTerm || !replace) {
            return;
        }
        const columns = getValues(COLUMNS_MODEL) as any[];
        columns.forEach((column, idx) => {
            const formula = column[COLUMN_FORMULA] || '';
            if (searchRegex?.test(formula)) {
                const newFormula = replaceInFormula(formula);
                setValue(`${COLUMNS_MODEL}[${idx}].${COLUMN_FORMULA}`, newFormula, { shouldDirty: true });
            }
        });
        performSearch(searchTerm);
    };

    const searchReplaceButton = useButtonWithTooltip({
        handleClick: handleOpen,
        label: 'spreadsheet/global-model-edition/search_replace_button',
        icon: <FindReplaceIcon />,
    });

    const closeSearchButton = useButtonWithTooltip({
        handleClick: handleClose,
        label: 'spreadsheet/global-model-edition/hide_search_button',
        icon: <ChevronLeftIcon />,
    });
    const inputRef = useRef<HTMLDivElement>(null);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', py: 1 }}>
            {open ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <QuickSearch
                            currentResultIndex={currentResultIndex}
                            onSearch={performSearch}
                            onNavigate={handleNavigate}
                            resultCount={searchResults.length}
                            resetSearch={() => performSearch('')}
                            placeholder="spreadsheet/global-model-edition/search"
                            sx={{ width: 280, maxWidth: 280 }}
                            inputRef={inputRef}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                sx={{ width: 280 }}
                                placeholder={intl.formatMessage({ id: 'spreadsheet/global-model-edition/replace' })}
                                value={replace}
                                onChange={(e) => setReplace(e.target.value)}
                            />
                            <Button onClick={handleReplaceNext} disabled={!searchTerm || !replace}>
                                {intl.formatMessage({ id: 'spreadsheet/global-model-edition/replace' })}
                            </Button>
                            <Button onClick={handleReplaceAll} disabled={!searchTerm || !replace}>
                                {intl.formatMessage({ id: 'spreadsheet/global-model-edition/replace_all' })}
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>{closeSearchButton}</Box>
                </Box>
            ) : (
                searchReplaceButton
            )}
        </Box>
    );
}
