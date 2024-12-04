/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { TextField, Grid, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { DisplayRounding } from '../display-rounding';
import { FILTER_DATA_TYPES } from '../custom-aggrid-header.type';
import { mergeSx } from '../../utils/functions';
import { useIntl } from 'react-intl';

const styles = {
    input: {
        minWidth: '250px',
        maxWidth: '40%',
    },
    noArrows: {
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            display: 'none',
        },
        '& input[type=number]': {
            MozAppearance: 'textfield',
        },
    },
};

interface CustomAggridTextFilterProps {
    value: unknown;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    isNumberInput: boolean;
    decimalAfterDot: number;
}

export const CustomAggridTextFilter: React.FC<CustomAggridTextFilterProps> = ({
    value,
    onChange,
    onClear,
    isNumberInput,
    decimalAfterDot = 0,
}) => {
    const intl = useIntl();

    return (
        <Grid container direction="column" gap={0.2}>
            <Grid item>
                <TextField
                    size={'small'}
                    fullWidth
                    value={value || ''}
                    onChange={onChange}
                    placeholder={intl.formatMessage({
                        id: 'filter.filterOoo',
                    })}
                    inputProps={{
                        type: isNumberInput ? FILTER_DATA_TYPES.NUMBER : FILTER_DATA_TYPES.TEXT,
                    }}
                    sx={mergeSx(styles.input, isNumberInput && styles.noArrows)}
                    InputProps={{
                        endAdornment: value ? (
                            <InputAdornment position="end">
                                <IconButton aria-label="clear filter" onClick={onClear} edge="end" size="small">
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
            </Grid>
            {isNumberInput && decimalAfterDot > 0 && (
                <Grid item>
                    <DisplayRounding decimalAfterDot={decimalAfterDot} />
                </Grid>
            )}
        </Grid>
    );
};
