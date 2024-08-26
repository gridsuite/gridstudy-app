/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, InputAdornment, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import { forwardRef, FunctionComponent, RefObject, useCallback, useImperativeHandle, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import { HyperFormula } from 'hyperformula';
import Handsontable from 'handsontable';
import Filters = Handsontable.plugins.Filters;
import { HotTableClass } from '@handsontable/react';

interface GlobalFilterHandsontableInterface {
    hotTableComponent: RefObject<HotTableClass>;
    hyperformulaInstance: HyperFormula;
    filtersPlugin?: Filters;
}

export const GlobalFilterHandsontable: FunctionComponent<GlobalFilterHandsontableInterface> = forwardRef(
    ({ hotTableComponent, hyperformulaInstance, filtersPlugin }, ref) => {
        const intl = useIntl();
        const inputRef = useRef<any>();

        const applyQuickFilter = useCallback(() => {
            const idColumnRange = hyperformulaInstance.simpleCellRangeToString(
                {
                    start: { sheet: hyperformulaInstance.getSheetId('Sheet1')!, col: 0, row: 0 },
                    end: {
                        sheet: hyperformulaInstance.getSheetId('Sheet1')!,
                        col: 0,
                        row: hotTableComponent.current?.hotInstance?.countRows()! - 1,
                    },
                },
                hyperformulaInstance.getSheetId('Sheet1')!
            );

            console.log('=FILTER(' + idColumnRange + ', ' + inputRef.current.value + ')');
            const res = hyperformulaInstance.calculateFormula(
                '=FILTER(' + idColumnRange + ', ' + inputRef.current.value + ')',
                hyperformulaInstance.getSheetId('Sheet1')!
            );
            //SEARCH("' +inputRef.current.value +'", F1:F337)

            console.log(res);
            filtersPlugin?.clearConditions();
            if (Array.isArray(res)) {
                filtersPlugin?.addCondition(0, 'by_value', [res.flat()]);
            } else {
                filtersPlugin?.addCondition(0, 'by_value', [[res]]);
            }
            filtersPlugin?.filter();
        }, [filtersPlugin, hotTableComponent, hyperformulaInstance]);

        const pasteSelection = useCallback(() => {
            const selectedRange = hotTableComponent.current?.hotInstance?.getSelectedRange();
            if (Array.isArray(selectedRange) && selectedRange.length > 0) {
                const rawRange = selectedRange[0];
                if (rawRange.from.row === rawRange.to.row && rawRange.from.col === rawRange.to.col) {
                    const address = hyperformulaInstance.simpleCellAddressToString(
                        {
                            sheet: 0,
                            col: rawRange.from.col,
                            row: rawRange.from.row,
                        },
                        hyperformulaInstance.getSheetId('Sheet1')!
                    );
                    inputRef.current.value += address;
                } else {
                    const startRow = rawRange.from.row < 0 ? 0 : rawRange.from.row;
                    const startCol = rawRange.from.col < 0 ? 0 : rawRange.from.col;

                    const range = hyperformulaInstance.simpleCellRangeToString(
                        {
                            start: { sheet: 0, col: startCol, row: startRow },
                            end: { sheet: 0, col: rawRange.to.col, row: rawRange.to.row },
                        },
                        hyperformulaInstance.getSheetId('Sheet1')!
                    );
                    inputRef.current.value += range;
                }
            }
        }, [hotTableComponent, hyperformulaInstance]);

        const resetFilter = useCallback(() => {
            inputRef.current.value = '';
        }, []);

        const getFilterValue = useCallback(() => {
            return inputRef.current?.value;
        }, []);

        useImperativeHandle(
            ref,
            () => {
                return {
                    resetFilter: resetFilter,
                    getFilterValue: getFilterValue,
                };
            },
            [getFilterValue, resetFilter]
        );

        const handleChangeFilter = useCallback((event: any) => {}, []);

        return (
            <Grid container>
                <Grid item xs={8}>
                    <TextField
                        size="small"
                        placeholder={intl.formatMessage({ id: 'filter' }) + '...'}
                        onChange={handleChangeFilter}
                        inputRef={inputRef}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color={'inherit'} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button onClick={pasteSelection}>Paste selection</Button>
                </Grid>
                <Grid item xs={2}>
                    <Button onClick={applyQuickFilter}>Apply formula</Button>
                </Grid>
            </Grid>
        );
    }
);
