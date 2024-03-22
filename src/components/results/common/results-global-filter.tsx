/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { Box } from '@mui/system';
import { Autocomplete, Chip, InputAdornment, TextField } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeSx } from '../../utils/functions';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';

const styles = {
    autocomplete: (theme) => ({
        width: '420px',
        '.MuiAutocomplete-inputRoot': {
            height: '40px',
            backgroundColor: 'unset', // prevents the field from changing size when selected with the keyboard
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            zIndex: 2,
            background: theme.palette.tabBackground,
        },
        '.MuiInputLabel-root': {
            zIndex: 3,
            width: 'auto',
        },
    }),
    chipBox: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        padding: '0.5em',
    },
    recentBox: (theme) => ({
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
    }),
    recentLabel: (theme) => ({
        color: theme.palette.text.secondary,
        fontSize: 'small',
        width: '100%',
        paddingLeft: 1,
    }),
    chip: (theme) => ({
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
    }),
    chipCountry: (theme) => ({
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
    }),
    chipVoltageLevel: (theme) => ({
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
    }),
};

const filters = [
    {
        label: 'FR',
        filterType: 'country',
        recent: true,
    },
    {
        label: '380 kV',
        filterType: 'voltageLevel',
    },
    {
        label: '220 kV',
        filterType: 'voltageLevel',
        recent: true,
    },
    {
        label: 'BE',
        filterType: 'country',
        recent: true,
    },
    {
        label: 'KR',
        filterType: 'country',
    },
    {
        label: 'IT',
        filterType: 'country',
        recent: true,
    },
    {
        label: '400 kV',
        filterType: 'voltageLevel',
        recent: true,
    },
    {
        label: '150 kV',
        filterType: 'voltageLevel',
    },
    {
        label: 'DE',
        filterType: 'country',
        recent: true,
    },
    {
        label: 'ES',
        filterType: 'country',
    },
];

const ResultsGlobalFilter = (props) => {
    const intl = useIntl();
    const { translate } = useLocalizedCountries();

    const getOptionLabel = useCallback(
        (option) =>
            option.filterType === 'country'
                ? translate(option.label)
                : option.label,
        [translate]
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
                options={filters.sort((a, b) => !!b.recent - !!a.recent)}
                groupBy={(option) => !!option.recent}
                // renderInput the inputfield that contains the chips, adornments and label
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
                            id={'chip_' + element}
                            size={'small'}
                            label={getOptionLabel(element)}
                            {...getTagsProps({ index })}
                            sx={mergeSx(
                                styles.chip,
                                element.filterType === 'country'
                                    ? styles.chipCountry
                                    : styles.chipVoltageLevel
                            )}
                        />
                    ))
                }
                // renderGroup : the box below that is visible when we focus on the AutoComplete
                renderGroup={(item) => {
                    const { group, children } = item;
                    const itemRecentAvailable = !!group;
                    return (
                        <Box
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
                renderOption={(props, option) => (
                    <Chip
                        {...props}
                        disableRipple
                        label={getOptionLabel(option)}
                        size="small"
                        sx={mergeSx(
                            styles.chip,
                            option.filterType === 'country'
                                ? styles.chipCountry
                                : styles.chipVoltageLevel
                        )}
                    />
                )}
            />
        </Box>
    );
};

export default ResultsGlobalFilter;
