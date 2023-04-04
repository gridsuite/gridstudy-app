/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, InputAdornment, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useIntl } from 'react-intl';
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';
import SearchIcon from '@mui/icons-material/Search';

const useStyles = makeStyles((theme) => ({
    searchSection: {
        paddingRight: theme.spacing(1),
        alignItems: 'center',
    },
    containerInputSearch: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
}));

export const GlobalFilter = forwardRef(
    ({ gridRef, disabled, visible }, ref) => {
        const classes = useStyles();
        const intl = useIntl();
        const inputRef = useRef();

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

        useImperativeHandle(
            ref,
            () => {
                return {
                    resetFilter: resetFilter,
                };
            },
            [resetFilter]
        );

        const handleChangeFilter = useCallback(
            (event) => {
                applyQuickFilter(event.target.value);
            },
            [applyQuickFilter]
        );

        useEffect(() => {
            applyQuickFilter(inputRef.current.value);
        }, [applyQuickFilter, visible]);

        return (
            <Grid item className={classes.containerInputSearch}>
                <TextField
                    disabled={disabled}
                    className={classes.textField}
                    size="small"
                    placeholder={intl.formatMessage({ id: 'filter' }) + '...'}
                    onChange={handleChangeFilter}
                    inputRef={inputRef}
                    fullWidth
                    InputProps={{
                        classes: {
                            input: classes.searchSection,
                        },
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon
                                    color={disabled ? 'disabled' : 'inherit'}
                                />
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
        );
    }
);
