/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InputAdornment, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';

const styles = {
    searchSection: (theme) => ({
        paddingRight: theme.spacing(1),
        alignItems: 'center',
    }),
};

export const GlobalFilter = forwardRef(({ gridRef, disabled }, ref) => {
    const intl = useIntl();
    const inputRef = useRef();

    const applyQuickFilter = useCallback(
        (filterValue) => {
            gridRef.current?.api?.setQuickFilter(filterValue);
        },
        [gridRef],
    );

    const resetFilter = useCallback(() => {
        inputRef.current.value = '';
        applyQuickFilter();
    }, [applyQuickFilter]);

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
        [getFilterValue, resetFilter],
    );

    const handleChangeFilter = useCallback(
        (event) => {
            applyQuickFilter(event.target.value);
        },
        [applyQuickFilter],
    );

    return (
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
    );
});
