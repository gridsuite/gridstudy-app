/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { DisplayRounding } from '../display-rounding';
import { useIntl } from 'react-intl';
import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';
import { FILTER_DATA_TYPES } from './custom-aggrid-filter.type';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { FilterParams } from '../../../types/custom-aggrid-types';

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
} as const satisfies MuiStyles;

interface CustomAggridTextFilterProps {
    colId: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    isNumberInput: boolean;
    decimalAfterDot: number;
    filterParams: FilterParams;
}

export const CustomAggridTextFilter: React.FC<CustomAggridTextFilterProps> = ({
    colId,
    onChange,
    onClear,
    isNumberInput,
    filterParams,
    decimalAfterDot = 0,
}) => {
    const [value, setValue] = useState('');
    const intl = useIntl();

    const { filters } = useFilterSelector(filterParams.type, filterParams.tab);

    const isRoundingDisplayed = useMemo(() => !!(isNumberInput && value), [isNumberInput, value]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const upperCaseValue = event.target.value.toUpperCase();
        setValue(upperCaseValue);
        onChange(event);
    };

    const handleClear = () => {
        setValue('');
        onClear();
    };

    useEffect(() => {
        const filterObject = filters?.find((filter) => filter.column === colId);
        if (filterObject) {
            setValue(String(filterObject.value));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Grid container direction="column" gap={0.2}>
            <Grid item>
                <TextField
                    size={'small'}
                    fullWidth
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={intl.formatMessage({
                        id: 'filter.filterOoo',
                    })}
                    inputProps={{
                        type: isNumberInput ? FILTER_DATA_TYPES.NUMBER : FILTER_DATA_TYPES.TEXT,
                    }}
                    sx={mergeSx(styles.input, isNumberInput ? styles.noArrows : undefined)}
                    InputProps={{
                        endAdornment: value ? (
                            <InputAdornment position="end">
                                <IconButton aria-label="clear filter" onClick={handleClear} edge="end" size="small">
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
            </Grid>
            {isRoundingDisplayed && (
                <Grid item>
                    <DisplayRounding decimalAfterDot={decimalAfterDot} />
                </Grid>
            )}
        </Grid>
    );
};
