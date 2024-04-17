/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeEvent, FunctionComponent, useCallback, useState } from 'react';
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
    containerStyle: {
        width: '250px',
    },
    iconStyle: {
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
    value?: string; // duration in seconds as a string
    onChange: (value?: string) => void;
}

const CustomAggridDurationFilter: FunctionComponent<
    ICustomAggridDurationFilter
> = ({ value, onChange }) => {
    const intl = useIntl();

    // Initialize minutes and seconds based on the initial value prop
    const parseInitialValue = useCallback(() => {
        if (value !== undefined && value !== '') {
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
                return {
                    minutes: Math.floor(numericValue / 60).toString(),
                    seconds: (numericValue % 60).toString(),
                };
            }
        }
        return { minutes: '', seconds: '' };
    }, [value]);
    const { minutes: initialMinutes, seconds: initialSeconds } =
        parseInitialValue();
    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);

    const handleTimeChange = useCallback(
        (newMinutes: string, newSeconds: string) => {
            // If both minutes and seconds are empty, clear the value
            if (newMinutes === '' && newSeconds === '') {
                onChange('');
            } else {
                const totalSeconds =
                    Number(newMinutes) * 60 + Number(newSeconds);
                onChange(totalSeconds.toString());
            }
        },
        [onChange]
    );

    const handleMinutesChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setMinutes(newValue);
            handleTimeChange(newValue, seconds);
        },
        [handleTimeChange, seconds]
    );

    const handleSecondsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            if (Number(newValue) > 59) {
                return;
            } // Prevents seconds from being greater than 59
            setSeconds(newValue);
            handleTimeChange(minutes, newValue);
        },
        [handleTimeChange, minutes]
    );

    const clearValue = useCallback(() => {
        onChange(''); // Clears the value
        setMinutes(''); // Reset minutes state
        setSeconds(''); // Reset seconds state
    }, [onChange]);

    return (
        <Grid item container columns={12} sx={styles.containerStyle}>
            <Grid item flex={1}>
                <TextField
                    fullWidth
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
                <Typography variant="body1">:</Typography>
            </Grid>
            <Grid item flex={1}>
                <TextField
                    fullWidth
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
                    <IconButton
                        onClick={clearValue}
                        sx={styles.iconStyle}
                        aria-label={intl.formatMessage({
                            id: 'resetToDefault',
                        })}
                    >
                        <ClearIcon />
                    </IconButton>
                </Grid>
            )}
        </Grid>
    );
};

export default CustomAggridDurationFilter;
