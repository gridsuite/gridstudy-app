/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import {
    Grid,
    InputAdornment,
    TextField,
    Typography,
    IconButton,
} from '@mui/material';
import { useIntl } from 'react-intl';
import ClearIcon from '@mui/icons-material/Clear';

const styles = {
    iconSize: {
        fontSize: '1rem',
        padding: '0',
    },
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noArrows: {
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
            {
                display: 'none',
            },
        '& input[type=number]': {
            MozAppearance: 'textfield',
        },
    },
};

interface ICustomAggridDurationFilter {
    value: string | undefined; // duration in seconds as a string
    onChange: (value: string | undefined) => void;
}

const CustomAggridDurationFilter: React.FC<ICustomAggridDurationFilter> = ({
    value,
    onChange,
}) => {
    const intl = useIntl();
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');

    useEffect(() => {
        if (value !== undefined && value !== '') {
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
                const mins = Math.floor(numericValue / 60).toString();
                const secs = (numericValue % 60).toString();
                setMinutes(mins);
                setSeconds(secs);
            }
        } else {
            setMinutes('');
            setSeconds('');
        }
    }, [value]);

    const handleMinutesChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.value;
        setMinutes(newValue);
        const totalSeconds = Number(newValue) * 60 + Number(seconds);
        onChange(totalSeconds.toString());
    };

    const handleSecondsChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.value;
        if (Number(newValue) > 59) {
            return;
        } // Prevents seconds from being greater than 59
        setSeconds(newValue);
        const totalSeconds = Number(minutes) * 60 + Number(newValue);
        onChange(totalSeconds.toString());
    };

    const clearValue = () => {
        onChange(''); // Clears the value
        setMinutes(''); // Reset minutes state
        setSeconds(''); // Reset seconds state
    };

    return (
        <Grid item container columns={12} sx={{ width: '250px' }}>
            <Grid item flex={1}>
                <TextField
                    size="small"
                    value={minutes}
                    onChange={handleMinutesChange}
                    placeholder={intl.formatMessage({ id: 'filter.filterOoo' })}
                    InputProps={{
                        type: 'number',
                        endAdornment: (
                            <InputAdornment position="end">mn</InputAdornment>
                        ),
                        inputProps: { min: 0 },
                    }}
                    sx={styles.noArrows}
                />
            </Grid>
            <Grid item xs={1} sx={styles.flexCenter}>
                <Typography variant="h6">:</Typography>
            </Grid>
            <Grid item flex={1}>
                <TextField
                    size="small"
                    value={seconds}
                    onChange={handleSecondsChange}
                    placeholder={intl.formatMessage({ id: 'filter.filterOoo' })}
                    InputProps={{
                        type: 'number',
                        endAdornment: (
                            <InputAdornment position="end">s</InputAdornment>
                        ),
                        inputProps: { min: 0, max: 59 },
                    }}
                    sx={styles.noArrows}
                />
            </Grid>
            {value !== undefined && value !== '' && (
                <Grid item xs={1} sx={styles.flexCenter} ml={0.5}>
                    <IconButton onClick={clearValue} sx={styles.iconSize}>
                        <ClearIcon />
                    </IconButton>
                </Grid>
            )}
        </Grid>
    );
};

export default CustomAggridDurationFilter;
