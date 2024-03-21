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
    filter: (theme) => ({
        height: '100%',
        width: 420,
        '& .Mui-expanded, & .Mui-focused, & .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            zIndex: 2,
            '&:not(:first-child)': {
                // Fixes the background of the input label when there is focus
                background:
                    'linear-gradient(to top, ' +
                    theme.palette.tabBackground +
                    ' 80%, transparent 80%)',
            },
        }, // TODO Fix transparent background when we select a chip with the keybord, in the inputField
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
            width: 'auto',
            position: 'relative',
        },
        // '&.Mui-focusVisible': {
        //     color: 'gold !important',
        //     backgroundColor: 'red !important',
        //     width: 'auto',
        //     position: 'relative',
        // },
    }),
    chipCountry: (theme) => ({
        '&.MuiChip-root': {
            backgroundColor: '#01579b',
        },
        '.MuiChip-deleteIcon': {
            color: '#b2daf1',
        },
        '&.MuiChip-root:hover': {
            backgroundColor: '#0277bd',
        },
        '&.Mui-focusVisible': {
            background: '#0288d1 !important',
        },
    }),
    chipVoltageLevel: (theme) => ({
        '&.MuiChip-root': {
            backgroundColor: '#1e88e5',
        },
        '& .MuiChip-deleteIcon': {
            color: '#bbdefb',
        },
        '&.MuiChip-root:hover': {
            backgroundColor: '#1976d2',
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
        <Box sx={styles.filter}>
            <Autocomplete
                multiple
                id="result-global-filter"
                size="small"
                limitTags={3}
                disableCloseOnSelect
                options={filters.sort((a, b) => !!b.recent - !!a.recent)}
                groupBy={(option) => !!option.recent}
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
                /*ListboxProps={{
                    sx: styles.openBoxList,
                }}*/
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
            />
        </Box>
    );
};

export default ResultsGlobalFilter;
