/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
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

    const handleToggle = () => {
        setOpen((prev) => !prev);
        setCurrentResultIndex(-1);
    };

    const replaceInFormula = (formula: string) => formula.split(searchTerm).join(replace);

    const focusFormula = useCallback(
        (rowIndex: number) => {
            const columns = getValues(COLUMNS_MODEL) as any[];
            const formula = columns[rowIndex][COLUMN_FORMULA] || '';
            const fieldName = `${COLUMNS_MODEL}[${rowIndex}].${COLUMN_FORMULA}`;
            setFocus(fieldName);
            setTimeout(() => {
                const input = document.querySelector(`textarea[name="${fieldName}"], input[name="${fieldName}"]`) as
                    | HTMLInputElement
                    | HTMLTextAreaElement
                    | null;
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
        if (searchResults.length === 0 || currentResultIndex < 0) {
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
        const columns = getValues(COLUMNS_MODEL) as any[];
        columns.forEach((column, idx) => {
            const formula = column[COLUMN_FORMULA] || '';
            if (searchTerm && formula.includes(searchTerm)) {
                const newFormula = replaceInFormula(formula);
                setValue(`${COLUMNS_MODEL}[${idx}].${COLUMN_FORMULA}`, newFormula, { shouldDirty: true });
            }
        });
        performSearch(searchTerm);
    };

    const searchReplaceButton = useButtonWithTooltip({
        handleClick: handleToggle,
        label: 'spreadsheet/global-model-edition/search_replace_button',
        icon: <FindReplaceIcon />,
    });

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                {open && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <QuickSearch
                            currentResultIndex={currentResultIndex}
                            onSearch={performSearch}
                            onNavigate={handleNavigate}
                            resultCount={searchResults.length}
                            resetSearch={() => performSearch('')}
                            placeholder="spreadsheet/global-model-edition/search"
                            sx={{ width: 280 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                sx={{ width: 280 }}
                                label={intl.formatMessage({ id: 'spreadsheet/global-model-edition/replace' })}
                                value={replace}
                                onChange={(e) => setReplace(e.target.value)}
                            />
                            <Button onClick={handleReplaceNext} disabled={!searchTerm}>
                                {intl.formatMessage({ id: 'spreadsheet/global-model-edition/replace' })}
                            </Button>
                            <Button onClick={handleReplaceAll} disabled={!searchTerm}>
                                {intl.formatMessage({ id: 'spreadsheet/global-model-edition/replace_all' })}
                            </Button>
                        </Box>
                    </Box>
                )}
                {searchReplaceButton}
            </Box>
        </>
    );
}
