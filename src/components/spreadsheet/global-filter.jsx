/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InputAdornment, TextField, FormGroup } from '@mui/material';
import { useIntl } from 'react-intl';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';

const styles = {
    searchSection: (theme) => ({
        paddingRight: theme.spacing(1),
        alignItems: 'center',
    }),
};

export const GlobalFilter = forwardRef(({ gridRef, disabled, handleFormulaFiltering }, ref) => {
    const intl = useIntl();
    const inputRef = useRef();
    const [isFormulaFilteringEnabled, setIsFormulaFilteringEnabled] = useState(false);

    const applyQuickFilter = useCallback(
        (filterValue) => {
            gridRef.current?.api?.setQuickFilter(filterValue);
        },
        [gridRef]
    );

    const resetFilter = useCallback(() => {
        inputRef.current.value = '';
        applyQuickFilter();
    }, [applyQuickFilter]);

    const getFilterValue = useCallback(() => {
        return inputRef.current?.value;
    }, []);

    const getFilterType = useCallback(() => {
        return isFormulaFilteringEnabled;
    }, [isFormulaFilteringEnabled]);

    useImperativeHandle(
        ref,
        () => {
            return {
                resetFilter: resetFilter,
                getFilterValue: getFilterValue,
                getFilterType: getFilterType,
            };
        },
        [getFilterValue, isFormulaFilteringEnabled, resetFilter]
    );

    const handleChangeFilter = useCallback(
        (event) => {
            if (!isFormulaFilteringEnabled) {
                applyQuickFilter(event.target.value);
            }
        },
        [applyQuickFilter, isFormulaFilteringEnabled]
    );

    const handleApplyFilter = useCallback(() => {
        if (isFormulaFilteringEnabled) {
            handleFormulaFiltering(inputRef.current.value);
        } else {
            applyQuickFilter(inputRef.current.value);
        }
    }, [applyQuickFilter, handleFormulaFiltering, isFormulaFilteringEnabled]);

    return (
        <>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isFormulaFilteringEnabled}
                            onChange={() => {
                                setIsFormulaFilteringEnabled((prevState) => !prevState);
                                resetFilter();
                            }}
                            defaultChecked
                        />
                    }
                    label="Formula filtering"
                />
            </FormGroup>
            <TextField
                disabled={disabled}
                size="small"
                placeholder={intl.formatMessage({ id: 'filter' }) + '...'}
                onChange={handleChangeFilter}
                inputRef={inputRef}
                fullWidth
                InputProps={{
                    sx: {
                        input: styles.searchSection,
                    },
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color={disabled ? 'disabled' : 'inherit'} />
                        </InputAdornment>
                    ),
                }}
            />

            <Button onClick={handleApplyFilter}>Apply filter</Button>
        </>
    );
});
