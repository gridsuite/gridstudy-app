/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InputAdornment, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    forwardRef,
    FunctionComponent,
    MutableRefObject,
    useCallback,
    useImperativeHandle,
    useRef,
} from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface GlobalFilterHandsontableInterface {
    hotTableComponent: MutableRefObject<any>;
}

export const GlobalFilterHandsontable: FunctionComponent<GlobalFilterHandsontableInterface> =
    forwardRef(({ hotTableComponent }, ref) => {
        const intl = useIntl();
        const inputRef = useRef<any>();

        const applyQuickFilter = useCallback(
            (filterValue: any) => {},
            [hotTableComponent]
        );

        const resetFilter = useCallback(() => {
            inputRef.current.value = '';
            //applyQuickFilter();
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
            [getFilterValue, resetFilter]
        );

        const handleChangeFilter = useCallback(
            (event: any) => {
                applyQuickFilter(event.target.value);
            },
            [applyQuickFilter]
        );

        return (
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
        );
    });
