/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useCallback } from 'react';
import { Autocomplete, Box, Chip, FilterOptionsState, InputAdornment, TextField, Theme } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeSx } from '../../utils/functions';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentGlobalFilters } from '../../../redux/actions';
import { AppState } from '../../../redux/reducer';
import { AppDispatch } from '../../../redux/store';

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
    filterTypeBox: (theme: Theme) => ({
        borderTop: '1px solid',
        borderColor: theme.palette.divider,
    }),
    groupLabel: (theme: Theme) => ({
        color: theme.palette.text.secondary,
        fontSize: '0.9em',
        width: '100%',
        paddingLeft: 1,
    }),
    chip: {
        '&.MuiChip-root': {
            borderRadius: '100px solid',
            margin: '4px 2px 4px 2px',
            padding: '0',
            color: 'white',
        },
        '.MuiChip-deleteIcon': {
            color: 'white',
            opacity: 0.6,
        },
        '.MuiChip-deleteIcon:hover': {
            color: 'white',
            opacity: 1,
        },
        '&.Mui-focusVisible': {
            width: 'unset', // prevents the chip from changing size when selected with the keyboard
            height: 'unset', // prevents the chip from changing size when selected with the keyboard
            position: 'relative',
        },
    },
    chipCountry: {
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `var(--info-main, #0288D1) !important`,
        },
        '&.MuiChip-root:hover': {
            backgroundColor: `var(--info-dark, #01579B) !important`,
        },
        '&.MuiChip-root:focus': {
            backgroundColor: `var(--info-dark, #01579B) !important`,
        },
    },
    chipVoltageLevel: {
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `var(--secondary-main, #9C27B0) !important`,
        },
        '&.MuiChip-root:hover': {
            backgroundColor: `var(--secondary-dark, #7B1FA2) !important`,
        },
        '&.MuiChip-root:focus': {
            backgroundColor: `var(--secondary-dark, #7B1FA2) !important`,
        },
    },
};

export enum FilterType {
    COUNTRY = 'country',
    VOLTAGE_LEVEL = 'voltageLevel',
}

const recentFilter: string = 'recent';

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

const ResultsGlobalFilter: FunctionComponent<ResultsGlobalFilterProps> = ({ onChange, filters = emptyArray }) => {
    const intl = useIntl();
    const { translate } = useLocalizedCountries();
    const dispatch = useDispatch<AppDispatch>();
    const recentGlobalFilters: Filter[] = useSelector((state: AppState) => state.recentGlobalFilters);

    const getOptionLabel = useCallback(
        (option: Filter) => (option.filterType === FilterType.COUNTRY ? translate(option.label) : option.label + ' kV'),
        [translate]
    );

    const getChipStyle = useCallback(
        (filter: Filter) =>
            mergeSx(
                styles.chip,
                filter.filterType === FilterType.COUNTRY ? styles.chipCountry : styles.chipVoltageLevel
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
                options={[
                    ...recentGlobalFilters.map((filter) => {
                        return { ...filter, recent: true };
                    }),
                    ...filters
                        .map((filter) => {
                            return { ...filter, recent: false };
                        })
                        .sort((a: Filter, b: Filter) => {
                            // only the countries are sorted alphabetically
                            if (a.filterType === FilterType.COUNTRY && b.filterType === FilterType.COUNTRY) {
                                return translate(a.label).localeCompare(translate(b.label));
                            }
                            return 0;
                        }),
                ]}
                onChange={handleChange}
                groupBy={(option: Filter): string => (option.recent ? recentFilter : option.filterType)}
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
                renderTags={(filters: Filter[], getTagsProps) =>
                    filters.map((element: Filter, index: number) => (
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
                    const recent: boolean = group === recentFilter;
                    return (
                        <Box key={'keyBoxGroup_' + group} sx={mergeSx(styles.chipBox, !recent && styles.filterTypeBox)}>
                            <Box sx={styles.groupLabel}>
                                <FormattedMessage id={'results.globalFilter.' + group} />
                            </Box>
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
                // Allows to find the corresponding chips without taking into account the recent status
                isOptionEqualToValue={(option: Filter, value: Filter) =>
                    option.label === value.label && option.filterType === value.filterType
                }
                // Allows to find the translated countries (and not their countryCodes) when the user inputs a search value
                filterOptions={(options: Filter[], state: FilterOptionsState<Filter>) =>
                    options.filter((option) => {
                        const labelToMatch =
                            option.filterType === FilterType.COUNTRY ? translate(option.label) : option.label;
                        return labelToMatch.toLowerCase().includes(state.inputValue.toLowerCase());
                    })
                }
            />
        </Box>
    );
};

export default ResultsGlobalFilter;
