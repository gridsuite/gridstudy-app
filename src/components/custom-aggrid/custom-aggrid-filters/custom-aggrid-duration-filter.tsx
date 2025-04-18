/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeEvent, FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import ClearIcon from '@mui/icons-material/Clear';
import { CustomAggridComparatorSelector } from './custom-aggrid-comparator-selector';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { useCustomAggridFilter } from './hooks/use-custom-aggrid-filter';
import { CustomAggridFilterParams } from './custom-aggrid-filter.type';

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
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            display: 'none',
        },
        '& input[type=number]': {
            MozAppearance: 'textfield',
        },
    },
};

const CustomAggridDurationFilter: FunctionComponent<CustomAggridFilterParams> = ({ api, colId, filterParams }) => {
    const intl = useIntl();

    const { selectedFilterData, selectedFilterComparator, handleChangeFilterValue, handleChangeComparator } =
        useCustomAggridFilter(api, colId, filterParams);

    const {
        comparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
    } = filterParams;

    const handleFilterComparatorChange = useCallback(
        (event: SelectChangeEvent) => {
            const newType = event.target.value;
            handleChangeComparator(newType);
        },
        [handleChangeComparator]
    );

    const handleClearFilter = useCallback(() => {
        handleChangeFilterValue({
            value: undefined,
        });
    }, [handleChangeFilterValue]);

    const handleFilterDurationChange = useCallback(
        (value?: string) => {
            handleChangeFilterValue({
                value,
            });
        },
        [handleChangeFilterValue]
    );

    // Initialize minutes and seconds based on the initial value prop
    const parseInitialValue = useCallback(() => {
        if (selectedFilterData !== undefined && selectedFilterData !== '') {
            const numericValue = Number(selectedFilterData);
            if (!isNaN(numericValue)) {
                return {
                    minutes: Math.floor(numericValue / 60).toString(),
                    seconds: (numericValue % 60).toString(),
                };
            }
        }
        return { minutes: '', seconds: '' };
    }, [selectedFilterData]);
    const { minutes: initialMinutes, seconds: initialSeconds } = parseInitialValue();
    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (!minutes && !seconds) {
            setMinutes(initialMinutes);
            setSeconds(initialSeconds);
        }
    }, [initialMinutes, initialSeconds, minutes, seconds]);

    const handleTimeChange = useCallback(
        (newMinutes: string, newSeconds: string) => {
            // If both minutes and seconds are empty, clear the value
            if (newMinutes === '' && newSeconds === '') {
                handleFilterDurationChange('');
            } else {
                const totalSeconds = Number(newMinutes) * 60 + Number(newSeconds);
                handleFilterDurationChange(totalSeconds.toString());
            }
        },
        [handleFilterDurationChange]
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
        handleClearFilter(); // Clears the value
        setMinutes(''); // Reset minutes state
        setSeconds(''); // Reset seconds state
    }, [handleClearFilter]);

    return (
        <Grid container direction={'column'} gap={0.8} sx={{ padding: '8px' }}>
            <CustomAggridComparatorSelector
                value={selectedFilterComparator}
                onChange={handleFilterComparatorChange}
                options={comparators}
            />
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
                            endAdornment: <InputAdornment position="end">mn</InputAdornment>,
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
                            endAdornment: <InputAdornment position="end">s</InputAdornment>,
                            inputProps: { min: 0, max: 59 },
                        }}
                        sx={styles.noArrows}
                    />
                </Grid>
                {selectedFilterData !== undefined && selectedFilterData !== '' && (
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
        </Grid>
    );
};

export default CustomAggridDurationFilter;
