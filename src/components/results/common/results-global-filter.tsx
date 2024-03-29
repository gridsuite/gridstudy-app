/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, SyntheticEvent, useCallback } from 'react';
import { Box } from '@mui/material';
import { Autocomplete, Chip, InputAdornment, TextField } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeSx } from '../../utils/functions';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentGlobalFilters } from '../../../redux/actions';
import { Theme } from '@mui/material';
import { ReduxState } from '../../../redux/reducer.type';

const styles = {
    autocomplete: (theme: Theme) => ({
        width: '420px',
        '.MuiAutocomplete-inputRoot': {
            height: '40px',
            backgroundColor: 'unset', // prevents the field from changing size when selected with the keyboard
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            zIndex: 20,
            background: theme.palette.tabBackground,
        },
        '.MuiInputLabel-root': {
            zIndex: 30,
            width: 'auto',
        },
    }),
    chipBox: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        padding: '0.5em',
    },
    recentBox: (theme: Theme) => ({
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
    }),
    recentLabel: (theme: Theme) => ({
        color: theme.palette.text.secondary,
        fontSize: 'small',
        width: '100%',
        paddingLeft: 1,
    }),
    chip: {
        '&.MuiChip-root': {
            margin: '4px 2px 4px 2px',
            padding: '0',
            color: 'white',
        },
        '.MuiChip-deleteIcon:hover': {
            color: 'white',
        },
        '&.Mui-focusVisible': {
            width: 'unset', // prevents the chip from changing size when selected with the keyboard
            height: 'unset', // prevents the chip from changing size when selected with the keyboard
            position: 'relative',
        },
    },
    chipCountry: {
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: '#01579b !important',
        },
        '.MuiChip-deleteIcon': {
            color: '#b2daf1',
        },
        '&.MuiChip-root:hover': {
            backgroundColor: '#0277bd !important',
        },
        '&.Mui-focusVisible': {
            background: '#0288d1 !important',
        },
    },
    chipVoltageLevel: {
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: '#1e88e5 !important',
        },
        '& .MuiChip-deleteIcon': {
            color: '#bbdefb',
        },
        '&.MuiChip-root:hover': {
            backgroundColor: '#1976d2 !important',
        },
        '&.Mui-focusVisible': {
            background: '#2196F3 !important',
        },
    },
};

export interface Filter {
    label: string;
    filterType: string;
    recent?: boolean;
}

export interface ResultsGlobalFilterProps {
    onChange: (value: Filter[]) => void;
    filters: Filter[];
}

const emptyArray: Filter[] = [];

const ResultsGlobalFilter: FunctionComponent<ResultsGlobalFilterProps> = ({
    onChange,
    filters = emptyArray,
}) => {
    const intl = useIntl();
    const { translate } = useLocalizedCountries();
    const dispatch = useDispatch();
    const recentGlobalFilters = useSelector(
        (state: ReduxState) => state.recentGlobalFilters
    );

    const getOptionLabel = useCallback(
        (option: Filter) =>
            option.filterType === 'country'
                ? translate(option.label)
                : option.label + ' kV',
        [translate]
    );

    const getChipStyle = useCallback(
        (filter: Filter) =>
            mergeSx(
                styles.chip,
                filter.filterType === 'country'
                    ? styles.chipCountry
                    : styles.chipVoltageLevel
            ),
        []
    );

    const handleChange = useCallback(
        (_event: SyntheticEvent<Element, Event>, value: Filter[]) => {
            // Updates the "recent" filters
            dispatch(addToRecentGlobalFilters(value));
            onChange(value);
        },
        [dispatch, onChange]
    );

    return (
        <Box>
            <Autocomplete
                sx={styles.autocomplete}
                multiple
                id="result-global-filter"
                size="small"
                limitTags={3}
                disableCloseOnSelect
                options={filters
                    .map((filter) => {
                        let isRecent = false;
                        if (
                            recentGlobalFilters &&
                            recentGlobalFilters.length > 0
                        ) {
                            isRecent = recentGlobalFilters.some(
                                (recent: Filter) =>
                                    recent.label === filter.label &&
                                    recent.filterType === filter.filterType
                            );
                        }
                        return { ...filter, recent: isRecent };
                    })
                    .sort((obj) => (obj.recent ? -1 : 1))}
                onChange={handleChange}
                groupBy={(option: any) => option.recent}
                // renderInput : the inputfield that contains the chips, adornments and label
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={intl.formatMessage({
                            id: 'results.globalFilter.fillerText',
                        })}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start">
                                        <FilterAlt />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                // renderTags : the chips in the inputField
                renderTags={(value, getTagsProps) =>
                    value.map((element, index) => (
                        <Chip
                            size={'small'}
                            label={getOptionLabel(element)}
                            {...getTagsProps({ index })}
                            sx={getChipStyle(element)}
                        />
                    ))
                }
                // renderGroup : the box below that is visible when we focus on the AutoComplete
                renderGroup={(item) => {
                    const { group, children } = item;
                    const itemRecentAvailable = !!group;
                    return (
                        <Box
                            key={'keyBoxGroup_' + group}
                            sx={mergeSx(
                                styles.chipBox,
                                itemRecentAvailable && styles.recentBox
                            )}
                        >
                            {itemRecentAvailable && (
                                <Box sx={styles.recentLabel}>
                                    <FormattedMessage id="results.globalFilter.recent" />
                                </Box>
                            )}
                            {children}
                        </Box>
                    );
                }}
                // renderOption : the chips that are in the box that is visible when we focus on the AutoComplete
                renderOption={(props, option: Filter) => {
                    const { children, color, ...otherProps } = props;
                    return (
                        <Chip
                            {...otherProps}
                            component="li"
                            label={getOptionLabel(option)}
                            size="small"
                            sx={getChipStyle(option)}
                        />
                    );
                }}
                isOptionEqualToValue={(option: Filter, value: Filter) =>
                    option.label === value.label &&
                    option.filterType === value.filterType
                }
            />
        </Box>
    );
};

export default ResultsGlobalFilter;
